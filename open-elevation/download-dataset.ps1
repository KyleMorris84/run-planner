# download-dataset.ps1
#
# Downloads and tiles the complete global SRTM 250m elevation dataset (~20 GB)
# by running the open-elevation Docker image's built-in create-dataset.sh script.
#
# Prerequisites: Docker Desktop running.
#
# Usage:
#   .\download-dataset.ps1

$ErrorActionPreference = "Stop"

$dataDir = Join-Path $PSScriptRoot "data"

if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir | Out-Null
}

Write-Host "This will download the complete SRTM 250m dataset into open-elevation\data\"
Write-Host "Be aware the directory may be over 20 GB when complete."
Write-Host ""
$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne "y") { exit 0 }

Write-Host "`nStarting download and tiling inside Docker..."
docker run --rm -it -v "${dataDir}:/code/data" openelevation/open-elevation /code/create-dataset.sh

Write-Host "`nDone. Start the app and the elevation service will use the new data."
