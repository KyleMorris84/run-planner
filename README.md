# Run Planner

A web app for planning running routes. Draw a path on a map and view the elevation profile along it. Restricted to the UK and Ireland (latitudes 50–60, longitudes -10 to 5).

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org) (LTS)
- winget (comes with Windows 10/11) — used by the HTTPS setup script

---

## First-time setup: HTTPS certificates

The app runs on HTTPS locally. Before starting for the first time, run the setup script from the repo root in PowerShell:

```powershell
.\setup-https.ps1
```

This will:
- Install [mkcert](https://github.com/FiloSottile/mkcert) via winget
- Create a locally-trusted CA and install it into your system trust store
- Generate a certificate for `localhost` in the `client/` folder
- Trust the .NET development certificate

The generated `.pem` files are git-ignored and stay on your machine.

### Firefox users

Firefox uses its own certificate store and won't pick up the system CA automatically. After running the script, do this once in Firefox:

1. Go to **Settings** → search **"certificates"** → click **View Certificates**
2. Open the **Authorities** tab → click **Import**
3. Select `C:\Users\<you>\AppData\Local\mkcert\rootCA.pem`
4. Tick **Trust this CA to identify websites** → OK → restart Firefox

---

## Running the app

There are two ways to run the app depending on whether you want to run the backend via Docker or locally with `dotnet run`.

### Option A — Hybrid (recommended for backend development)

The database and elevation service run in Docker; the API runs locally so you get hot reload and debugger support.

**1. Start infrastructure (PostgreSQL + Open-Elevation):**
```bash
docker compose up -d
```

**2. Start the API:**
```bash
cd LogInPage
dotnet run
```
API runs on `https://localhost:7204`.

**3. Start the frontend:**
```bash
cd client
npm install   # first time only
npm run dev
```
App runs on `https://localhost:3000`.

---

### Option B — Full Docker

Everything runs in containers. Useful for testing the full stack without a local .NET install.

**1. Start everything:**
```bash
docker compose -f docker-compose-full.yml up -d
```
This starts PostgreSQL, Open-Elevation, and the API (on `http://localhost:7204`).

**2. Start the frontend:**
```bash
cd client
npm install   # first time only
npm run dev:docker
```
App runs on `https://localhost:3000`. The `dev:docker` script points the API proxy at `http://localhost:7204` to match the container's HTTP-only backend.

---

## Elevation data

The Open-Elevation service reads tiled GeoTIFF files from `open-elevation/data/`. The repository already includes tiles covering the UK and Ireland. If you need to add coverage for other regions, or want to replace the existing tiles with the full global dataset, there are two options.

**Prerequisites for both options:** Docker Desktop must be running.

### Option 1 — Add your own tiles (recommended for specific regions)

1. Download the `.tif` file(s) for your region from [srtm.csi.cgiar.org](https://srtm.csi.cgiar.org/srtmdata/)
2. Place the downloaded `.tif` file(s) into `open-elevation/data/`
3. From the `open-elevation/` directory, run:
   ```powershell
   .\create-tiles.ps1 -TifFile your-file.tif
   ```
   This splits the large file into smaller tiles using GDAL inside Docker, then removes the original. Repeat for each file.

### Option 2 — Download the full global dataset

This downloads the complete worldwide SRTM 250m dataset. **The data directory will be over 20 GB when complete.**

From the `open-elevation/` directory, run:
```powershell
.\download-dataset.ps1
```