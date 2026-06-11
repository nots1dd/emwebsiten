# emwebsiten

my website built with emscripten and plain html,css and javascript.

## Deps

1. emscripten (via emsdk)
2. cmake
3. OpenGL

## Source tree

- `frontend`: all the HTML, CSS and JS stuff (core website logic)

- `include`, `src`: C++ code for the scenes and transitions (via emscripten)

- `assets/shaders`: Shaders that comprise of scene and transition files

- `public`: all public accessible files go here

## Credits

1. Alexander Alekseev aka **TDM** - `Seascape` shader [link](https://www.shadertoy.com/view/Ms2SD1)
2. stduhpf - `another synthwave sunset thing` shader [link](https://www.shadertoy.com/view/tsScRK)

## License

Certain shaders are licensed as per their original authors that I have modified (check credits section), the rest is under BSD 3 Clause.

## Adding Texture Channels (iChannel0..)

This project supports binding additional texture channels that your fragment shaders can access as `iChannel0`, `iChannel1`, etc. The renderer binds sceneA/sceneB to texture units 0 and 1; user channels start at texture unit 2.

Two ways to provide textures:

1. From JavaScript (recommended for web-based assets): use `frontend/scripts/textures.js` which exposes `loadTexture(url, channelIndex)` — it creates a WebGL texture, registers it with Emscripten's GL bridge and calls into the WASM `set_channel` function. Example usage in your frontend code:

   const { loadTexture } = await import('./scripts/textures.js');
   loadTexture('/assets/logo.jpg', 0).then(id => console.log('iChannel0 id', id));

2. From C++: you can call `Renderer::set_channel(index, tex)` if you create the GL texture on the native side. There's an exported function `set_channel(int, unsigned int)` available to JS as `Module._set_channel`.

In your GLSL fragment shader use `uniform sampler2D iChannel0;` and sample it via `texture(iChannel0, uv)`.
