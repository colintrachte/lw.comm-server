# LaserWeb4 Dev Environment Setup Guide

A practical guide to forking, building, and running LaserWeb4 from source on Windows, based on hard-won experience. This covers both repos you need: the frontend (`LaserWeb4`) and the communications server (`lw.comm-server`).

---

## Prerequisites

- **Git** installed
- **Node.js v18 LTS** — this is the sweet spot. v24 is too new for native modules (serialport, node-hid). Use [nvm-windows](https://github.com/coreybutler/nvm-windows) to manage versions.
- **Visual Studio 2022** with the **"Desktop development with C++"** workload installed (required for native module compilation)
- A GitHub account with forks of both repos

### Set Node version with nvm

```bash
nvm install 18.20.0
nvm use 18.20.0
node --version    # should show v18.x
```

---

## Repo 1: LaserWeb4 (Frontend)

**GitHub:** https://github.com/LaserWeb/LaserWeb4

Fork this repo on GitHub, then clone your fork locally.

```bash
git clone https://github.com/YOUR_USERNAME/LaserWeb4.git
cd LaserWeb4
git checkout dev-es6
```

> **Important:** The active development branch is `dev-es6`, not `main`.

### Install dependencies

The repo uses Webpack 5 but has an old `babel-loader@7` that only supports Webpack 2–4. Use the legacy peer deps flag to resolve this:

```bash
npm install --legacy-peer-deps
```

### Initialize submodules

The `src/data/` folder contains two git submodules (`lw.machines` and `lw.materials`) that hold machine profiles and materials databases. These are **not** cloned automatically — you must initialize them manually:

```bash
git submodule update --init --recursive
```

> **Note:** The `npm run installdev` script listed in the wiki is missing from the repo. The above command is its equivalent.

### Build the frontend

```bash
npm run bundle-dev
```

This compiles everything in `src/` and outputs the built app to `dist/`. A successful build looks like:

```
webpack 5.x compiled successfully in ~15000ms
```

If you see errors about `lw.machines` or `lw.materials` not found, re-run the submodule step above.

### LaserWeb4 Command Summary

| Command | What it does |
|---|---|
| `git checkout dev-es6` | Switch to the active dev branch |
| `npm install --legacy-peer-deps` | Install all dependencies |
| `git submodule update --init --recursive` | Initialize machine/materials data submodules |
| `npm run bundle-dev` | Compile source → `dist/` for development |
| `npm run bundle-prod` | Compile optimized production build |
| `npm start` | Run webpack dev server with hot reload (port 8080) |

---

## Repo 2: lw.comm-server (Backend)

**GitHub:** https://github.com/LaserWeb/lw.comm-server

Fork this repo on GitHub, then clone your fork alongside LaserWeb4 (same parent folder):

```bash
cd ..   # back to your Git root folder
git clone https://github.com/YOUR_USERNAME/lw.comm-server.git
cd lw.comm-server
```

Your folder structure should look like this:

```
D:\Git\
  ├── LaserWeb4\
  └── lw.comm-server\
```

### Install dependencies

```bash
npm install
```

You will see deprecation warnings — these are expected and harmless. As long as you don't see `npm error` the install succeeded.

If you see a `node-gyp` error about Visual Studio, make sure the **"Desktop development with C++"** workload is installed in VS2022 (open Visual Studio Installer → Modify → check that workload).

### Point the server at your frontend fork

By default the server serves the pre-built frontend from its own `app/` folder. To serve your fork's `dist/` output instead, edit `config.js`:

```js
// Change this line:
config.uipath = path.join(__dirname, '/app')

// To this:
config.uipath = path.join(__dirname, '../LaserWeb4/dist')
```

Or better — keep `config.js` clean and use a `.env` file. First add the env variable support to `config.js`:

```js
config.uipath = process.env.UI_PATH || path.join(__dirname, '/app')
```

Then create a `.env` file in the `lw.comm-server` root (you can use the included `create_env.bat` as a starting point):

```env
UI_PATH=../LaserWeb4/dist
WEB_PORT=8000
RESET_ON_CONNECT=1
```

### Start the server

```bash
node server.js
```

Or:

```bash
npm start
```

The server starts and prints the URL to connect to — open that in your browser (usually `http://localhost:8000`).

### lw.comm-server Command Summary

| Command | What it does |
|---|---|
| `npm install` | Install all dependencies |
| `create_env.bat` | Create a starter `.env` config file |
| `node server.js` | Start the comm server |
| `npm start` | Same as above (npm alias) |

---

## Full Dev Workflow

Once both repos are set up, your day-to-day loop is:

1. **Start the comm server** (leave it running):
   ```bash
   cd lw.comm-server
   npm start
   ```

2. **Edit frontend source** in `LaserWeb4/src/`

3. **Rebuild the frontend:**
   ```bash
   cd LaserWeb4
   npm run bundle-dev
   ```

4. **Refresh browser** at `http://localhost:8000` — the comm server is already serving your updated `dist/`.

> **Faster alternative:** Run `npm start` in the LaserWeb4 folder to use webpack-dev-server with hot module reload on port 8080. You skip the manual rebuild step, but you'll need to connect it to the comm server's websocket manually.

---

## Troubleshooting

**`npm install` fails with `ERESOLVE` on LaserWeb4**
Use `--legacy-peer-deps`. The project has a babel-loader/webpack version mismatch that requires this flag.

**`npm install` fails on `node-hid` or `node-gyp`**
You're probably on the wrong Node version. Switch to Node 18 with nvm. Also make sure VS2022 has the C++ workload installed.

**Build errors: `Can't resolve '../data/lw.machines/machines'`**
The git submodules haven't been initialized. Run:
```bash
git submodule update --init --recursive
```

**`npm run installdev` not found**
That script is missing from the current repo. Use `git submodule update --init --recursive` instead.

**Browser shows old UI after rebuilding**
Hard refresh with `Ctrl+Shift+R`. The browser may have cached the old JS bundle.

**Server starts but can't connect to machine**
Check the `.env` file — `RESET_ON_CONNECT=1` is often needed for boards that require a reset signal on connection.
