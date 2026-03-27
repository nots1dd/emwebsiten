#include <algorithm>
#include <memory>
#include <print>

#include <mywebsite/core/AssetManager.hpp>
#include <mywebsite/core/Engine.hpp>
#include <mywebsite/scene/Home.hpp>
#include <mywebsite/scene/Page2.hpp>
#include <mywebsite/scene/transitions/ShaderTransition.hpp>

#include <emscripten/html5.h>

static double lastTime = 0.0;

static bool key_w = false;
static bool key_a = false;
static bool key_s = false;
static bool key_d = false;

void Engine::set_mouse(float x, float y)
{
  mouse_x = x;
  mouse_y = y;
}

void Engine::accumulate_mouse_delta(float dx, float dy)
{
  mouse_dx += dx;
  mouse_dy += dy;
}

EM_BOOL keydown_callback(int, const EmscriptenKeyboardEvent* e, void* userData)
{
  if (e->ctrlKey || e->metaKey)
    return EM_FALSE;

  auto* engine = static_cast<Engine*>(userData);

  char k = std::tolower(e->key[0]);

  if (k == 'w')
    key_w = true;
  if (k == 'a')
    key_a = true;
  if (k == 's')
    key_s = true;
  if (k == 'd')
    key_d = true;

  if (k == '1')
    engine->transition_to_page2();
  if (k == '2')
    engine->transition_to_home();

  if (k == 'r')
  {
    std::println("[Engine] Reloading shaders");

    AssetManager::instance().shaders().reload_all();
  }

  return EM_TRUE;
}

EM_BOOL keyup_callback(int, const EmscriptenKeyboardEvent* e, void*)
{
  if (e->ctrlKey || e->metaKey)
    return EM_FALSE;

  char k = std::tolower(e->key[0]);

  if (k == 'w')
    key_w = false;
  if (k == 'a')
    key_a = false;
  if (k == 's')
    key_s = false;
  if (k == 'd')
    key_d = false;

  return EM_TRUE;
}

EM_BOOL wheel_callback(int, const EmscriptenWheelEvent* e, void* userData)
{
  auto* engine = static_cast<Engine*>(userData);

  auto* node = engine->graph_.current();
  if (!node)
    return EM_FALSE;

  Camera& cam = node->camera();

  float zoom = cam.zoom();

  zoom += e->deltaY * 0.001f;
  zoom = std::clamp(zoom, 0.2f, 5.0f);

  cam.set_zoom(zoom);

  return EM_TRUE;
}

void Engine::transition_to_page2()
{
  auto& glitch = AssetManager::instance().shaders().program<ShaderID::liquid_transition>();

  auto transition = std::make_unique<ShaderTransition>(glitch, 1.0f);

  graph_.transition(std::make_unique<Page2Scene>(), std::move(transition));
}

void Engine::transition_to_home()
{
  auto& glitch = AssetManager::instance().shaders().program<ShaderID::liquid_transition>();

  auto transition = std::make_unique<ShaderTransition>(glitch, 1.0f);

  graph_.transition(std::make_unique<HomeScene>(), std::move(transition));
}

void Engine::init()
{
  AssetManager::instance().initialize();

  static Renderer renderer;
  renderer_ = &renderer;

  double dpr = emscripten_get_device_pixel_ratio();

  int w, h;
  emscripten_get_canvas_element_size("#canvas", &w, &h);

  int fb_w = int(w * dpr);
  int fb_h = int(h * dpr);

  emscripten_set_canvas_element_size("#canvas", fb_w, fb_h);

  renderer_->init(fb_w, fb_h);

  graph_.set(std::make_unique<Page2Scene>());

  emscripten_set_wheel_callback(EMSCRIPTEN_EVENT_TARGET_DOCUMENT, this, true, wheel_callback);

  emscripten_set_keydown_callback(EMSCRIPTEN_EVENT_TARGET_DOCUMENT, this, true, keydown_callback);

  emscripten_set_keyup_callback(EMSCRIPTEN_EVENT_TARGET_DOCUMENT, this, true, keyup_callback);
}

void Engine::frame()
{
  double now = emscripten_get_now() * 0.001;

  double delta = now - lastTime;
  lastTime     = now;

  mouse_x = std::clamp(mouse_x, 0.0f, 1.0f);
  mouse_y = std::clamp(mouse_y, 0.0f, 1.0f);

  graph_.update(delta);

  auto* node = graph_.current();

  if (node)
  {
    Camera& cam = node->camera();

    float speed = 2.5f * delta;

    if (key_w)
      cam.move_forward(speed);
    if (key_s)
      cam.move_backward(speed);
    if (key_a)
      cam.move_left(speed);
    if (key_d)
      cam.move_right(speed);

    float sensitivity = 0.002f;

    cam.rotate(mouse_dx * sensitivity, mouse_dy * sensitivity);

    mouse_dx = 0;
    mouse_dy = 0;
  }

  renderer_->set_mouse(mouse_x, mouse_y);

  graph_.render(*renderer_);
}
