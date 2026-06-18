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

## Deployment

Vercel deployment is documented in [`docs/vercel-deployment.md`](docs/vercel-deployment.md).
The short version: build the Emscripten output first, assemble `dist/` with
`./scripts/build-vercel-dist.sh`, then deploy that static bundle. The included
GitHub Actions workflow handles this automatically when the Vercel secrets are
configured.

## Some shader inspirations

These are pretty old inspirations as none of the current shaders match these but they did teach me a thing or two bout coding one.

1. Alexander Alekseev aka **TDM** - `Seascape` shader [link](https://www.shadertoy.com/view/Ms2SD1)
2. stduhpf - `another synthwave sunset thing` shader [link](https://www.shadertoy.com/view/tsScRK)

> [!NOTE]
> 
> Will add more details on this soon
> 

## License

Certain shaders are licensed as per their original authors that I have modified (check credits section), the rest is under BSD 3 Clause.

## Adding Texture Channels (iChannel0..)

This project supports binding additional texture channels that your fragment shaders can access as `iChannel0`, `iChannel1`, etc. The renderer binds sceneA/sceneB to texture units 0 and 1; user channels start at texture unit 2.

Two ways to provide textures:

1. From JavaScript (never gonna use this but...): use `frontend/scripts/textures.js` which exposes `loadTexture(url, channelIndex)` — it creates a WebGL texture, registers it with Emscripten's GL bridge and calls into the WASM `set_channel` function. Example:

   const { loadTexture } = await import('./scripts/textures.js');
   loadTexture('/assets/logo.jpg', 0).then(id => console.log('iChannel0 id', id));

2. From C++ (currently using this): you can call `Renderer::set_channel(index, tex)` if you create the GL texture on the native side. There's an exported function `set_channel(int, unsigned int)` available to JS as `Module._set_channel`.
