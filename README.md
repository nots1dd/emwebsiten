# emwebsiten

My personal website, built with emscripten and plain HTML, CSS and JavaScript — no
framework, no build step for the frontend, just a bunch of hand-written files.

The fun part is the background: every page sits on top of a live WebGL2 shader
scene that's written in C++ and compiled to WebAssembly. Each route gets its own
scene, light and dark themes re-light everything in real time, and flipping
between them fires a shader transition (a spacetime rip, a sunrise, a frost
bloom — depends on the page).

## What you'll need

1. emscripten (via emsdk)
2. cmake
3. OpenGL

## Running it locally

`scripts/run-website.sh` builds the WASM bundle and serves the site with
`scripts/spa_server.py`, a tiny static server that knows how to fall back to
`index.html` for client-side routes like `/blog/anvilock`. If you already have
a build, you can run the server on its own:

```sh
python3 scripts/spa_server.py --port 8080
```

## Source tree

- `frontend`: all the HTML, CSS and JS (the actual website — router, pages,
  theme, input handling, the lot)
- `include`, `src`: the C++ behind the scenes and transitions, compiled via
  emscripten
- `assets/shaders`: the GLSL for the scenes and transitions
- `public`: anything publicly addressable (blogs, images, resume, favicon)

## How the blog works

Posts are plain markdown files in `public/blogs/`, registered in
`frontend/content.js` under `BLOG_POSTS` — that one list drives both the `/blog`
index and each post page, so adding a post means dropping in an `.md` file and
copying a block.

The markdown is rendered by md4c, compiled into the same WASM module as the
graphics. 

## Deployment

Vercel deployment is documented in [`docs/vercel-deployment.md`](docs/vercel-deployment.md).
The short version: build the Emscripten output first, assemble `dist/` with
`./scripts/build-vercel-dist.sh`, then deploy that static bundle. The included
GitHub Actions workflow handles this automatically when the Vercel secrets are
configured.

## Some shader inspirations

These are pretty old inspirations as none of the current shaders match these but
they did teach me a thing or two bout coding one.

1. Alexander Alekseev aka **TDM** - `Seascape` shader [link](https://www.shadertoy.com/view/Ms2SD1)
2. stduhpf - `another synthwave sunset thing` shader [link](https://www.shadertoy.com/view/tsScRK)

## License

Certain shaders are licensed as per their original authors that I have modified
(check the credits section), the rest is under BSD 3 Clause.

## Adding Texture Channels (iChannel0..)

This project supports binding additional texture channels that your fragment
shaders can access as `iChannel0`, `iChannel1`, etc. The renderer binds
sceneA/sceneB to texture units 0 and 1; user channels start at texture unit 2.

Two ways to provide textures:

1. From JavaScript (never gonna use this but...): use
   `frontend/scripts/textures.js` which exposes `loadTexture(url, channelIndex)`
   — it creates a WebGL texture, registers it with Emscripten's GL bridge and
   calls into the WASM `set_channel` function. Example:

   ```js
   const { loadTexture } = await import('./scripts/textures.js');
   loadTexture('/assets/logo.jpg', 0).then(id => console.log('iChannel0 id', id));
   ```

2. From C++ (currently using this): you can call `Renderer::set_channel(index, tex)`
   if you create the GL texture on the native side. There's an exported function
   `set_channel(int, unsigned int)` available to JS as `Module._set_channel`.
