param(
  [Parameter(Mandatory = $true)]
  [string]$HexoRoot,

  [string]$TargetName = "wonderful-beads"
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$target = Join-Path $HexoRoot "source\$TargetName"

Push-Location $projectRoot
try {
  npm run build
  if (Test-Path $target) {
    Remove-Item -LiteralPath $target -Recurse -Force
  }
  New-Item -ItemType Directory -Force -Path $target | Out-Null
  Copy-Item -Path (Join-Path $projectRoot "dist\*") -Destination $target -Recurse -Force
  Write-Host "Copied dist to $target"
  Write-Host "Then run in your Hexo project: hexo clean; hexo generate; hexo deploy"
}
finally {
  Pop-Location
}
