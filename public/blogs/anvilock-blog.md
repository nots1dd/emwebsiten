# **How I Made a Wayland Screen Locker from Scratch**  

## **Introduction**  

Wayland is the modern display protocol that aims to replace X11. Wayland has a much more different (ultimately simpler) architecture of handling clients than X11 and gives clients a more secure and up-to-date desktop environment experience that X11 simply cannot.

However, creating a screen locker for Wayland isn't as straightforward as it was with X11. 
Unlike X11, where you could simply grab the screen and overlay a window, Wayland enforces stricter security policies, requiring the use of specific protocols like **ext-session-lock-v1**.  

In this blog, I’ll walk you through how I built **ANVILOCK**, a Wayland screen locker, from scratch—covering protocols, rendering, authentication, and more!

## **Understanding the Challenge: Why Wayland is Different**  

Screen locking in Wayland requires an explicit protocol, `ext-session-lock-v1`, which is implemented under Wayland as an **UNSTABLE** protocol, and is used by newer and maintained compositors like **Hyprland**, **Sway**, and **Wayfire**. Desktop Environments (DEs) like KDE and GNOME have modified versions of this protocol and have a much more sandboxed environment in comparison to Window Manager Compositors (WMs). So in this blog let us focus on WMs as they are more streamlined with Wayland protocols and are simply better. (*Not subject to debate*) 

Unlike X11, where screen grabbing was easy, Wayland enforces strict security boundaries, meaning:  

-> The compositor must **allow** session locking.  
-> The locker **cannot** override system input unless permitted.  
-> The protocol must handle **authentication, buffers, and unlocking** properly.  

To add on top of this, X11 has been around for **MUCH** longer than Wayland has, and automatically comes with more API support and documentation, whereas Wayland is still very much under development and has no *clear* and absolute documentation hub that has everything you need to get started. (Wayland references like the Wayland book and others are incomplete)

The above is quite a big hurdle to pass as with what information I could gather, I had to rely on incomplete API & structural docs with a combination of reading source code of existing screen lockers and random tutorials I found online.

Thus, I first created a knowledge dump of everything I came across that I found useful to start this project and learn more about Wayland as a whole:

🔗 **Knowledge dump here**: [GitHub - nots1dd/mywayland](https://github.com/nots1dd/mywayland)

I was now ready to get started with the project.

## **Project Structure**  

#------------------------------------------------#

## **NOTE:**

```text
The anvilock repository will soon undergo massive structural changes that could lead to this blog being slightly misleading. 
The core concept and implementation will remain the same nevertheless.

Every code snippet taken from Anvilock may be subject to change so do NOT blindly try to use or understand the code.
It is advised to read and understand the implementation as that is far more useful.
```

#------------------------------------------------#

ANVILOCK follows a modular architecture, separating protocol handling, rendering, and authentication.  

Here’s an overview of the project's structure:  

```bash
ANVILOCK
├── CHANGELOG/
├── LICENSE
├── README.md
├── SECURITY.md
├── VERSION
├── include/
│   ├── config/
│   │   ├── config.h
│   ├── deprecated/
│   │   ├── surface_colors.h
│   │   ├── unicode.h
│   │   └── NOTE.md
│   ├── freetype/
│   │   └── freetype.h
│   ├── graphics/
│   │   ├── egl.h
│   │   └── shaders.h
│   ├── memory/
│   │   └── anvil_mem.h
│   ├── pam/
│   │   ├── pam.h
│   │   └── password_buffer.h
│   ├── wayland/
│   │   ├── session_lock_handle.h
│   │   ├── shared_mem_handle.h
│   │   ├── wl_buffer_handle.h
│   │   ├── wl_keyboard_handle.h
│   │   ├── wl_output_handle.h
│   │   ├── wl_pointer_handle.h
│   │   ├── wl_registry_handle.h
│   │   ├── wl_seat_handle.h
│   │   ├── xdg_surface_handle.h
│   │   └── xdg_wm_base_handle.h
│   ├── global_funcs.h 
│   ├── client_state.h 
│   ├── log.h 
│   └── NOTE.md 
├── src/
│   ├── main.c 
│   └── main.h
├── toml
│   ├── toml.h
│   └── toml.c
├── shaders/
├── Makefile
├── meson.build
├── CMakeLists.txt
├── stb_image.h
└── protocols
    ├── xdg-shell-client-protocol.h
    ├── ext-session-lock-client-protocol.h
    └── src
        ├── xdg-shell-client-protocol.c
        └── ext-session-lock-client-protocol.c
```

Those are a lot of files at first glance but each file has a specific purpose that makes it easy to understand the flow of the project.

### **Key Components**  

- **Wayland Initialization**: Become a client of the Wayland server through the compositor and bind all seats (interfaces) to the registry.
- **Wayland Protocol Handling**: Implements `ext-session-lock-v1` for secure session locking, then generate a session lock surface.  
- **Rendering**: Uses EGL and OpenGL for drawing the lock screen, and freetype to render unicode chars onto the surface.  
- **Authentication**: Uses **PAM (Pluggable Authentication Modules)** to verify the user’s credentials.  
- **Configuration**: Uses a simple **TOML** config file for background customization.  

---

# **Building the Lock Screen: Protocols, Rendering, Input, and Authentication**  

A **Wayland screen locker** requires handling multiple components—session locking, rendering, input management, and authentication. In this post, I’ll walk through how ANVILOCK achieves this by leveraging **Wayland protocols, EGL rendering, XKB for keyboard input, and PAM for authentication**.

## **Using `ext-session-lock-v1` for Locking**  

The **Wayland session lock protocol** (`ext-session-lock-v1`) is required to **lock the screen** securely. This protocol provides the ability to:  

- **Create a locked surface** that overlays the screen.  
- **Capture keyboard input** exclusively for password entry.  
- **Handle unlocking logic** after successful authentication.  

### **Wayland Protocol Registration**  

To use `ext-session-lock-v1`, we need to generate the necessary Wayland headers:  

```bash
wayland-scanner client-header protocols/ext-session-lock-v1.xml > ext-session-lock-client-protocol.h
wayland-scanner private-code protocols/ext-session-lock-v1.xml > ext-session-lock-client-protocol.c
```

Then, we establish the **Wayland connection** and register the protocol:

```c
/* This is just a snippet from Anvilock (Subject to change) */
static int initialize_wayland(struct client_state* state)
{
    state->wl_display = wl_display_connect(NULL); // state is the global state struct (check anvilock source repo for more)
    if (!state->wl_display)
    {
        log_message(LOG_LEVEL_ERROR, "Failed to connect to Wayland display\n");
        return -1;
    }

    state->wl_registry = wl_display_get_registry(state->wl_display);
    wl_registry_add_listener(state->wl_registry, &wl_registry_listener, state);
    wl_display_roundtrip(state->wl_display); // Ensures registry objects are initialized

    state->wl_surface  = wl_compositor_create_surface(state->wl_compositor);
    state->xdg_surface = xdg_wm_base_get_xdg_surface(state->xdg_wm_base, state->wl_surface);
    xdg_surface_add_listener(state->xdg_surface, &xdg_surface_listener, state);

    state->xdg_toplevel = xdg_surface_get_toplevel(state->xdg_surface);
    xdg_toplevel_set_title(state->xdg_toplevel, "Anvilock");

    return 0;
}
```

---

## **Understanding `wl_registry` and Object Discovery**  

### **How `wl_registry` Works**  

The `wl_registry` is responsible for **detecting global Wayland objects** exposed by the compositor. These objects include:  

- **Compositor** (`wl_compositor`) → Creates surfaces.  
- **Seat** (`wl_seat`) → Represents an input device (keyboard, pointer, touch).  
- **Session Lock Manager** (`ext_session_lock_manager_v1`) → Controls screen locking.  

### **Registry Listener**  

We register a listener to handle events when Wayland announces global objects:  

```c
/* This is just a snippet from Anvilock (Subject to change) */
static void registry_handle_global(void *data, struct wl_registry *registry, uint32_t id,
                                   const char *interface, uint32_t version)
{
    struct client_state *state = data;

    if (strcmp(interface, wl_compositor_interface.name) == 0)
    {
        state->wl_compositor = wl_registry_bind(registry, id, &wl_compositor_interface, 4);
    }
    else if (strcmp(interface, wl_seat_interface.name) == 0)
    {
        state->wl_seat = wl_registry_bind(registry, id, &wl_seat_interface, 7);
        wl_seat_add_listener(state->wl_seat, &seat_listener, state);
    }
    else if (strcmp(interface, ext_session_lock_manager_v1_interface.name) == 0)
    {
        state->lock_manager = wl_registry_bind(registry, id, &ext_session_lock_manager_v1_interface, 1);
    }
}

static const struct wl_registry_listener registry_listener = {
    .global = registry_handle_global,
    .global_remove = NULL
};
```

---

## **Wayland Surfaces: Committing, Dispatching, and Roundtrips**  

### **Surface Creation and Committing**  

A **Wayland surface** (`wl_surface`) represents a region of the screen where a client can draw content. When we modify a surface (e.g., change its contents), we must **commit** it to notify the compositor:

```c
static void commit_surface(struct client_state *state)
{
    wl_surface_commit(state->wl_surface);
}
```

### **Understanding `wl_display_dispatch` and `wl_display_roundtrip`**  

Wayland uses an **event-driven model**, where clients must process events from the server:  

1. **`wl_display_dispatch`** → Processes pending events **asynchronously** (non-blocking).  
2. **`wl_display_roundtrip`** → Sends a request and waits for a response **synchronously** (blocking).  

Example:  

```c
wl_display_roundtrip(state->wl_display); // Ensures global objects are initialized
```

---

## **Handling Keyboard Input with XKB**  

### **Why XKB?**  

XKB (X Keyboard Extension) is needed for:  

- **Translating raw keycodes into characters.**  
- **Supporting different keyboard layouts.**  
- **Handling modifiers (Shift, Ctrl, Alt, etc.).**  

### **Initializing XKB**  

```c
static void initialize_xkb(struct client_state* state)
{
    state->xkb_context = xkb_context_new(XKB_CONTEXT_NO_FLAGS);
    state->xkb_keymap = xkb_keymap_new_from_names(state->xkb_context, NULL, XKB_KEYMAP_COMPILE_NO_FLAGS);
    state->xkb_state = xkb_state_new(state->xkb_keymap);
}
```

### **Processing Key Events**  

```c
static void handle_key(void *data, struct wl_keyboard *keyboard,
                       uint32_t serial, uint32_t time, uint32_t key, uint32_t state)
{
    struct client_state *client = data;

    if (state == WL_KEYBOARD_KEY_STATE_PRESSED)
    {
        char buffer[64];
        xkb_keysym_t sym = xkb_state_key_get_one_sym(client->xkb_state, key + 8);
        xkb_keysym_get_name(sym, buffer, sizeof(buffer));

        log_message(LOG_LEVEL_DEBUG, "Key Pressed: %s", buffer);
    }
}
```

---

### **Rendering with EGL and OpenGL**  

Once the protocol was in place, I needed to **draw the lock screen**. Instead of using a bloated GUI toolkit, I opted for **raw OpenGL via EGL**. This allowed me to:  

- Render a custom **background image** using `stb_image.h`.  
- Overlay **password input UI** dynamically.  
- Ensure **smooth animations** without performance overhead.  

Firstly, let us see how I loaded the lock screen background:

```c
/* A snippter from Anvilock (Subject to change) */
static GLuint load_texture(const char* filepath)
{
  int            width, height, channels;
  unsigned char* image = stbi_load(filepath, &width, &height, &channels, STBI_rgb_alpha);
  if (!image)
  {
    log_message(LOG_LEVEL_ERROR, "Failed to load image: %s", filepath);
    exit(EXIT_FAILURE);
  }

  GLuint texture;
  glGenTextures(1, &texture);
  glBindTexture(GL_TEXTURE_2D, texture);
  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, image);

  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

  stbi_image_free(image);
  return texture;
}
```

Next, you need to initialize EGL and ensure that it is found and binded to the `wl_display` struct that Wayland provides.

After doing this **ONLY** can you actually render things onto the session lock surface.

Brace yourselves this is big snippet:

```c 
static void init_egl(struct client_state* state)
{
  // Get the EGL display connection using Wayland's display
  state->egl_display = eglGetDisplay((EGLNativeDisplayType)state->wl_display);
  if (state->egl_display == EGL_NO_DISPLAY)
  {
    log_message(LOG_LEVEL_ERROR, "Failed to get EGL display\n");
    exit(EXIT_FAILURE);
  }

  // Initialize the EGL display
  if (!eglInitialize(state->egl_display, NULL, NULL))
  {
    log_message(LOG_LEVEL_ERROR, "Failed to initialize EGL");
    exit(EXIT_FAILURE);
  }

  // Bind the OpenGL ES API
  if (!eglBindAPI(EGL_OPENGL_ES_API))
  {
    log_message(LOG_LEVEL_ERROR, "Failed to bind OpenGL ES API");
    exit(EXIT_FAILURE);
  }

  // EGL configuration: specifies rendering type and color depth
  EGLint    attribs[] = {EGL_RENDERABLE_TYPE,
                         EGL_OPENGL_ES2_BIT,
                         EGL_SURFACE_TYPE,
                         EGL_WINDOW_BIT,
                         EGL_RED_SIZE,
                         8,
                         EGL_GREEN_SIZE,
                         8,
                         EGL_BLUE_SIZE,
                         8,
                         EGL_NONE};
  EGLConfig config;
  EGLint    num_configs;
  if (!eglChooseConfig(state->egl_display, attribs, &config, 1, &num_configs) || num_configs < 1)
  {
    log_message(LOG_LEVEL_ERROR, "Failed to choose EGL config");
    exit(EXIT_FAILURE);
  }

  // Create an EGL context for OpenGL ES 2.0
  EGLint context_attribs[] = {EGL_CONTEXT_CLIENT_VERSION, 2, EGL_NONE};
  state->egl_context =
    eglCreateContext(state->egl_display, config, EGL_NO_CONTEXT, context_attribs);
  if (state->egl_context == EGL_NO_CONTEXT)
  {
    log_message(LOG_LEVEL_ERROR, "Failed to create EGL context");
    exit(EXIT_FAILURE);
  }

  // Ensure Wayland surface events are processed before creating EGL window
  wl_display_roundtrip(state->wl_display);

  // Validate output dimensions and create EGL window surface
  int width         = state->output_state.width > 0 ? state->output_state.width : 1920;
  int height        = state->output_state.height > 0 ? state->output_state.height : 1080;
  state->egl_window = wl_egl_window_create(state->wl_surface, width, height);
  if (!state->egl_window)
  {
    log_message(LOG_LEVEL_ERROR, "Failed to create wl_egl_window");
    exit(EXIT_FAILURE);
  }

  state->egl_surface = eglCreateWindowSurface(state->egl_display, config,
                                              (EGLNativeWindowType)state->egl_window, NULL);
  if (state->egl_surface == EGL_NO_SURFACE)
  {
    EGLint error = eglGetError();
    log_message(LOG_LEVEL_ERROR, "Failed to create EGL surface, error code: %x", error);
    exit(EXIT_FAILURE);
  }

  // Make the EGL context current
  if (!eglMakeCurrent(state->egl_display, state->egl_surface, state->egl_surface,
                      state->egl_context))
  {
    log_message(LOG_LEVEL_ERROR, "Failed to make EGL context current");
    exit(EXIT_FAILURE);
  }

  // Set the OpenGL viewport to match the window size
  glViewport(0, 0, width, height);

  // Load the image and create a texture
  /* 
   * If you remember, this is the function we wrote above to load an image 
   * and render it using stb_image and OpenGL ES 2.0 !!
   * 
   */
  GLuint texture = load_texture(state->user_configs.background_path);

  // Use the texture for rendering
  glBindTexture(GL_TEXTURE_2D, texture);

  // Clear color buffer
  glClear(GL_COLOR_BUFFER_BIT);

  // Render the quad with the texture
  const char* vertex_shader_source = load_shader_source(SHADERS_INIT_EGL_VERTEX);
  GLuint      vertex_shader        = glCreateShader(GL_VERTEX_SHADER);
  glShaderSource(vertex_shader, 1, &vertex_shader_source, NULL);
  glCompileShader(vertex_shader);

  // Check for vertex shader compile errors
  GLint compile_status;
  glGetShaderiv(vertex_shader, GL_COMPILE_STATUS, &compile_status);
  if (compile_status == GL_FALSE)
  {
    log_message(LOG_LEVEL_ERROR, "Vertex shader compilation failed");
    exit(EXIT_FAILURE);
  }

  const char* fragment_shader_source = load_shader_source(SHADERS_INIT_EGL_FRAG);
  GLuint      fragment_shader        = glCreateShader(GL_FRAGMENT_SHADER);
  glShaderSource(fragment_shader, 1, &fragment_shader_source, NULL);
  glCompileShader(fragment_shader);

  // Check for fragment shader compile errors
  glGetShaderiv(fragment_shader, GL_COMPILE_STATUS, &compile_status);
  if (compile_status == GL_FALSE)
  {
    log_message(LOG_LEVEL_ERROR, "Fragment shader compilation failed");
    exit(EXIT_FAILURE);
  }

  GLuint shader_program = glCreateProgram();
  glAttachShader(shader_program, vertex_shader);
  glAttachShader(shader_program, fragment_shader);
  glLinkProgram(shader_program);

  GLint link_status;
  glGetProgramiv(shader_program, GL_LINK_STATUS, &link_status);
  if (link_status == GL_FALSE)
  {
    log_message(LOG_LEVEL_ERROR, "Shader program linking failed");
    exit(EXIT_FAILURE);
  }

  glUseProgram(shader_program);

  GLint position_location = glGetAttribLocation(shader_program, "position");
  GLint texCoord_location = glGetAttribLocation(shader_program, "texCoord");
  glVertexAttribPointer(position_location, 2, GL_FLOAT, GL_FALSE, 0, quad_vertices);
  glEnableVertexAttribArray(position_location);
  glVertexAttribPointer(texCoord_location, 2, GL_FLOAT, GL_FALSE, 0, tex_coords);
  glEnableVertexAttribArray(texCoord_location);

  glUniform1i(glGetUniformLocation(shader_program, "uTexture"), 0);

  glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);

  /* This is our own custom rendering model to load a password field (Your own rendering logic goes here!) */
  render_password_field(state);

  eglSwapBuffers(state->egl_display, state->egl_surface);
}
```

That was a lot! But why is all this needed? Looking at this code this may seem easy or doable with some help from our beloved LLMs, but it is really important 
to understand how this works as this actually initializes the display to use OpenGL ES 2.0 which is crucial for the application as it allows for cool graphics programming to generate cool lockscreens onto the wl_surface.

The `init_egl` function is responsible for initializing an EGL rendering context within a Wayland environment, setting up OpenGL ES for rendering, loading and rendering a background texture, and drawing a simple UI element (a password field). 

### **Detailed Breakdown of the Function**

#### **1. Obtain the EGL Display**
```c
state->egl_display = eglGetDisplay((EGLNativeDisplayType)state->wl_display);
```
- Retrieves the EGL display connection using the Wayland display (`state->wl_display`).
- If this fails, the program logs an error and exits.

#### **2. Initialize the EGL Display**
```c
eglInitialize(state->egl_display, NULL, NULL);
```
- Initializes the EGL display.
- If initialization fails, the program logs an error and exits.

#### **3. Bind OpenGL ES API**
```c
eglBindAPI(EGL_OPENGL_ES_API);
```
- Specifies that the rendering API to be used is OpenGL ES.

#### **4. Choose an EGL Configuration**
```c
EGLint    attribs[] = {EGL_RENDERABLE_TYPE, EGL_OPENGL_ES2_BIT, ...};
eglChooseConfig(state->egl_display, attribs, &config, 1, &num_configs);
```
- Selects an appropriate EGL configuration that supports OpenGL ES 2.0 and an 8-bit color depth.
- If no valid configuration is found, it logs an error and exits.

#### **5. Create an EGL Context**
```c
EGLint context_attribs[] = {EGL_CONTEXT_CLIENT_VERSION, 2, EGL_NONE};
state->egl_context = eglCreateContext(state->egl_display, config, EGL_NO_CONTEXT, context_attribs);
```
- Creates an EGL rendering context that supports OpenGL ES 2.0.
- If context creation fails, logs an error and exits.

#### **6. Ensure Wayland Surface Events Are Processed**
```c
wl_display_roundtrip(state->wl_display);
```
- Ensures that pending Wayland events are processed before continuing.

#### **7. Create EGL Window Surface**
```c
state->egl_window = wl_egl_window_create(state->wl_surface, width, height);
state->egl_surface = eglCreateWindowSurface(state->egl_display, config, (EGLNativeWindowType)state->egl_window, NULL);
```
- Creates a Wayland-compatible EGL window surface of size `width × height`.
- If creation fails, logs an error and exits.

#### **8. Make the EGL Context Current**
```c
eglMakeCurrent(state->egl_display, state->egl_surface, state->egl_surface, state->egl_context);
```
- Makes the EGL context current, so subsequent OpenGL ES commands affect this surface.

#### **9. Set Up OpenGL Viewport**
```c
glViewport(0, 0, width, height);
```
- Defines the viewport size, matching the window dimensions.

#### **10. Load Background Texture**
```c
GLuint texture = load_texture(state->user_configs.background_path);
glBindTexture(GL_TEXTURE_2D, texture);
```
- Loads an image from `state->user_configs.background_path` and creates an OpenGL texture.
- Binds the texture for rendering.

#### **11. Clear the Color Buffer**
```c
glClear(GL_COLOR_BUFFER_BIT);
```
- Clears the screen before rendering.

#### **12. Load and Compile Vertex Shader**
```c
const char* vertex_shader_source = load_shader_source(SHADERS_INIT_EGL_VERTEX);
GLuint vertex_shader = glCreateShader(GL_VERTEX_SHADER);
glShaderSource(vertex_shader, 1, &vertex_shader_source, NULL);
glCompileShader(vertex_shader);
```
- Loads the vertex shader source code.
- Creates and compiles a vertex shader.
- If compilation fails, logs an error and exits.

#### **13. Load and Compile Fragment Shader**
```c
const char* fragment_shader_source = load_shader_source(SHADERS_INIT_EGL_FRAG);
GLuint fragment_shader = glCreateShader(GL_FRAGMENT_SHADER);
glShaderSource(fragment_shader, 1, &fragment_shader_source, NULL);
glCompileShader(fragment_shader);
```
- Loads, creates, and compiles a fragment shader.
- If compilation fails, logs an error and exits.

#### **14. Link Shaders into a Shader Program**
```c
GLuint shader_program = glCreateProgram();
glAttachShader(shader_program, vertex_shader);
glAttachShader(shader_program, fragment_shader);
glLinkProgram(shader_program);
```
- Links the vertex and fragment shaders into a complete shader program.
- If linking fails, logs an error and exits.

#### **15. Use the Shader Program**
```c
glUseProgram(shader_program);
```
- Activates the compiled shader program for rendering.

#### **16. Configure Vertex Attributes**
```c
GLint position_location = glGetAttribLocation(shader_program, "position");
GLint texCoord_location = glGetAttribLocation(shader_program, "texCoord");
glVertexAttribPointer(position_location, 2, GL_FLOAT, GL_FALSE, 0, quad_vertices);
glEnableVertexAttribArray(position_location);
glVertexAttribPointer(texCoord_location, 2, GL_FLOAT, GL_FALSE, 0, tex_coords);
glEnableVertexAttribArray(texCoord_location);
```
- Retrieves attribute locations for vertex positions and texture coordinates.
- Defines how vertex data is read from `quad_vertices` and `tex_coords`.

#### **17. Bind the Texture to the Shader**
```c
glUniform1i(glGetUniformLocation(shader_program, "uTexture"), 0);
```
- Binds the texture uniform in the shader.

#### **18. Render a Password Field**
```c
render_password_field(state);
```
- Calls another function that presumably renders a password input field. (from this point on it is your own logic of rendering stuff onto the surface!)

#### **20. Swap Buffers**
```c
eglSwapBuffers(state->egl_display, state->egl_surface);
```
- Displays the rendered content on screen.

### **Summary (TLDR)**
- Initializes EGL and OpenGL ES 2.0 in a Wayland environment.
- Creates an EGL window surface with a specified width and height.
- Loads and applies a texture (background image).
- Compiles and links shaders for rendering a quad.
- Renders a textured quad (likely as a UI background).
- Calls `render_password_field(state)` to draw a password input field.
- Swaps buffers to display the rendered frame.

Great now we have initialized EGL and binded it to wl_display with our rendering logic! 

---

## **Handling Authentication with PAM**  

To unlock the screen, ANVILOCK needs to **verify the user’s password**. For this, I integrated **PAM (Pluggable Authentication Modules)**:  

```c
// A very naive demo of how PAM works
#include <security/pam_appl.h>

static int pam_conversation(int num_msg, const struct pam_message **msg, struct pam_response **resp, void *appdata_ptr) {
    struct pam_response *reply = malloc(sizeof(struct pam_response));
    reply->resp = strdup((char *)appdata_ptr);
    reply->resp_retcode = 0;
    *resp = reply;
    return PAM_SUCCESS;
}

int authenticate(const char *password) {
    pam_handle_t *pamh = NULL;
    struct pam_conv conv = { pam_conversation, (void *)password };

    int ret = pam_start("login", getenv("USER"), &conv, &pamh);
    if (ret == PAM_SUCCESS) ret = pam_authenticate(pamh, 0);
    pam_end(pamh, ret);
    
    return ret == PAM_SUCCESS;
}
```

There is a lot of documentation and tutorials around using libpam, so this part should not really bother you too much.

You can view Anvilock's source code for PAM logic [here](https://github.com/muvilon/anvilock/blob/main/pam.h) to know more!

When the user **enters a password**, the PAM module checks it, and if successful, ANVILOCK **unlocks the screen**

---

## **Configuring ANVILOCK**  

ANVILOCK uses quite a primitive **TOML-based config file** for user customization.

We aim to make this more useful and more powerful in the future :)

Config file location:  
```bash
~/.config/anvilock/config.toml
```

### **Example Configuration**  

```toml
[bg]
path = "/home/user/wallpapers/lockscreen.png"
```

This allows users to change the **lock screen background** easily!  

---

## **Challenges and Lessons Learned**  

1. **Wayland Security**: Understanding how the `ext-session-lock-v1` protocol worked was crucial.
2. **Understanding Wayland itself**: 

This was the most exhaustive part of learning that required a lot of brainpower from my side to really understand the Wayland architecture and how it is supposed to work (of course you could just use LLMs and get somewhere but at some point even it will hallucinate, leaving you with a half-baked application)


3. **Rendering with EGL**: Using raw OpenGL instead of GUI toolkits saved performance. (And binding to wl_display was by far the most challenging)  
4. **Handling Authentication**: 

PAM made authentication simple but required careful memory handling. Simply storing the password in a datastructure is not advised as there is always a chance of your data being stored to disk if a crash *were* to occur. Ideally, such sensitive data is stored in an arena allocated in RAM itself, so when the application crashes, the sensitive data is lost and cannot be retrieved whatsoever.

Building a **Wayland screen locker** from scratch wasn’t easy, but it was and is an amazing learning experience!

This project is not done either! It aims to be software that is accessible and customizable to *NIX users across most Wayland compositors.

---

## **Future Improvements**  

- [ ] **Custom UI Elements** (Fonts, Animations)  
- [ ] **Multi-Monitor Support**  
- [ ] **Better Error Handling & Debugging Tools**  
- [ ] **Support for Additional Authentication Methods**  

For now, ANVILOCK is a **Work in Progress**, but I’m excited to keep improving it!

---

## **Conclusion**  

ANVILOCK is a lightweight **Wayland screen locker** that works with compositors like **Hyprland, Sway, and Wayfire**. By leveraging Wayland protocols, EGL rendering, and PAM authentication, it provides a **secure and efficient** locking mechanism.  

🔗 **Source Code**: [GitHub - Muvilon/Anvilock](https://github.com/muvilon/anvilock)
