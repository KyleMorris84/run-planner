# create-tiles.ps1
#
# Splits a large SRTM GeoTIFF file into smaller tiles suitable for
# open-elevation. Uses GDAL via the open-elevation Docker image so no
# local GDAL install is required.
#
# Prerequisites: Docker Desktop running.
#
# Usage:
#   .\create-tiles.ps1 -TifFile srtm_35_01.tif
#   .\create-tiles.ps1 -TifFile srtm_35_01.tif -XTiles 10 -YTiles 10
#
# Workflow:
#   1. Download the .tif file for your region from https://srtm.csi.cgiar.org/srtmdata/
#   2. Place it in the open-elevation\data\ directory
#   3. Run this script, passing the filename
#   4. The script tiles the file and removes the original

param(
    [Parameter(Mandatory, HelpMessage = "Name of the .tif file placed in open-elevation\data\")]
    [string]$TifFile,

    [int]$XTiles = 10,
    [int]$YTiles = 10
)

$ErrorActionPreference = "Stop"

$dataDir = Join-Path $PSScriptRoot "data"
$fullPath = Join-Path $dataDir $TifFile

if (-not (Test-Path $fullPath)) {
    Write-Error "File not found: $fullPath`nPlace the .tif in open-elevation\data\ first."
    exit 1
}

Write-Host "Tiling $TifFile into ${XTiles}x${YTiles} grid using Docker..."
docker run --rm -it -v "${dataDir}:/code/data" openelevation/open-elevation `
    /code/create-tiles.sh "/code/data/$TifFile" $XTiles $YTiles

Write-Host "`nRemoving original file..."
Remove-Item $fullPath

Write-Host "Done. Tiles are in open-elevation\data\"
