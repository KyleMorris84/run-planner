# setup-https.ps1
# Installs mkcert, generates a locally-trusted HTTPS certificate for the Vite
# dev server, and trusts the .NET development certificate.
# Run once from the repo root before starting the app for the first time.

$ErrorActionPreference = "Stop"

# --- 1. Find or install mkcert ---
$mkcertCmd = Get-Command mkcert -ErrorAction SilentlyContinue

if ($mkcertCmd) {
    $mkcert = $mkcertCmd.Source
    Write-Host "mkcert already installed at $mkcert"
} else {
    Write-Host "Installing mkcert via winget..."
    winget install FiloSottile.mkcert --source winget --accept-source-agreements --accept-package-agreements

    # winget doesn't update PATH in the current session, so find the exe directly
    $mkcert = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter "mkcert.exe" -ErrorAction SilentlyContinue |
              Select-Object -First 1 -ExpandProperty FullName

    if (-not $mkcert) {
        Write-Error "mkcert installation failed or executable not found. Please install manually from https://github.com/FiloSottile/mkcert"
        exit 1
    }

    Write-Host "mkcert installed at $mkcert"
}

# --- 2. Install the local CA into the system trust store ---
Write-Host "`nInstalling local CA into system trust store..."
& $mkcert -install

# --- 3. Generate a certificate for localhost in client/ ---
$clientDir = Join-Path $PSScriptRoot "client"
Write-Host "`nGenerating localhost certificate in $clientDir..."
Push-Location $clientDir
try {
    & $mkcert localhost 127.0.0.1 ::1
} finally {
    Pop-Location
}

# --- 4. Trust the .NET development certificate ---
Write-Host "`nTrusting .NET development certificate..."
dotnet dev-certs https --trust

Write-Host "`nDone! HTTPS is ready."
Write-Host ""
Write-Host "Firefox users: you need one extra step."
Write-Host "  1. Open Firefox > Settings > search 'certificates' > View Certificates"
Write-Host "  2. Authorities tab > Import"
Write-Host "  3. Select: $env:LOCALAPPDATA\mkcert\rootCA.pem"
Write-Host "  4. Tick 'Trust this CA to identify websites' > OK > restart Firefox"
