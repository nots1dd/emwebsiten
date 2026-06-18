# Vercel Deployment

This project deploys to Vercel as a static site, but it is not a normal
HTML-only build. The page loads Emscripten artifacts from `/build`:

- `build/site.js`
- `build/site.wasm`
- `build/site.data`

Those files are generated from the C++/GLSL side of the project and are not
committed to git. The deploy process must build them before Vercel publishes
the site.

## Files

- `vercel.json` configures the Vercel build command, static output directory,
  SPA rewrites, and WASM content type.
- `scripts/build-vercel-dist.sh` builds or reuses the Emscripten bundle and
  assembles the static deploy folder at `dist/`.
- `.github/workflows/deploy-vercel.yml` builds with Emscripten in GitHub
  Actions and deploys to Vercel.

## Local Build Check

From a shell with Emscripten available:

```bash
source /path/to/emsdk/emsdk_env.sh
./scripts/build-vercel-dist.sh
```

This creates:

```text
dist/
  index.html
  frontend/
  public/
  build/
    site.js
    site.wasm
    site.data
```

To inspect the generated static bundle locally:

```bash
python3 scripts/spa_server.py --host 127.0.0.1 --port 8080 --directory dist
```

Open `http://127.0.0.1:8080`.

## Recommended Deployment: GitHub Actions

Use the included workflow instead of relying on Vercel's default Git import.
The workflow installs Emscripten, builds `dist/`, asks Vercel CLI to produce
the deployment output, then deploys it.

Create a Vercel project first, then add these repository secrets in GitHub:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

You can get the org and project IDs by linking locally once:

```bash
vercel link
cat .vercel/project.json
```

Do not commit `.vercel/project.json`; keep the IDs in GitHub secrets.

After the secrets are set, push to `main` or run the workflow manually from
GitHub Actions.

## Direct Vercel Git Import

Direct import can work only if Vercel's build environment has Emscripten
available. This repo's `vercel.json` runs:

```bash
./scripts/build-vercel-dist.sh
```

If `build/site.js`, `build/site.wasm`, and `build/site.data` are missing and
`emcmake` is not installed, that command will fail. That is why the GitHub
Actions route is the safer default.

## Manual CLI Deployment

For one-off deploys from your machine:

```bash
source /path/to/emsdk/emsdk_env.sh
./scripts/build-vercel-dist.sh
vercel deploy --prod dist
```

This bypasses Vercel's remote build step because the static output already
exists locally.
