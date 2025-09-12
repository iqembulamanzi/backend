# tools/apply-logo-color.ps1
# Copies Downloads/WaterPolutionProject.png -> public/admin/assets/logo.png
# Computes average color via System.Drawing, updates --sidebar-accent and .sidebar gradient

$src = Join-Path $env:USERPROFILE 'Downloads\WaterPolutionProject.png'
$dst = 'C:\Users\ntoam\Desktop\Projects\WaterPolution\Backend\backend\public\admin\assets\logo.png'
$cssPath = 'C:\Users\ntoam\Desktop\Projects\WaterPolution\Backend\backend\public\admin\css\dashboard.css'

if (-Not (Test-Path $src)) {
  Write-Error "Source file not found: $src`nPlease put 'WaterPolutionProject.png' in your Downloads folder or adjust the script."
  exit 1
}

$assetsDir = [System.IO.Path]::GetDirectoryName($dst)
if (-Not (Test-Path $assetsDir)) {
  New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null
}

Copy-Item -Path $src -Destination $dst -Force
Write-Host "Copied image to: $dst"

Add-Type -AssemblyName System.Drawing
try {
  $bmp = [System.Drawing.Bitmap]::FromFile($dst)
  $thumb = New-Object System.Drawing.Bitmap 1,1
  $g = [System.Drawing.Graphics]::FromImage($thumb)
  $g.DrawImage($bmp, 0,0,1,1)
  $avg = $thumb.GetPixel(0,0)
  $g.Dispose(); $thumb.Dispose(); $bmp.Dispose();
} catch {
  Write-Error "Failed to process image. Ensure .NET System.Drawing is available in this PowerShell host."; exit 1
}

$hex = ('#{0:X2}{1:X2}{2:X2}' -f $avg.R, $avg.G, $avg.B)
Write-Host "Detected average color: $hex"

function Adjust-Color($hex, $factor) {
  $r = [Convert]::ToInt32($hex.Substring(1,2),16)
  $g = [Convert]::ToInt32($hex.Substring(3,2),16)
  $b = [Convert]::ToInt32($hex.Substring(5,2),16)
  $nr = [math]::Max(0, [math]::Min(255, [int]($r * $factor)))
  $ng = [math]::Max(0, [math]::Min(255, [int]($g * $factor)))
  $nb = [math]::Max(0, [math]::Min(255, [int]($b * $factor)))
  return ('#{0:X2}{1:X2}{2:X2}' -f $nr, $ng, $nb)
}

$dark = Adjust-Color $hex 0.78
$light = Adjust-Color $hex 1.12

if (-Not (Test-Path $cssPath)) { Write-Error "CSS file not found: $cssPath"; exit 1 }

$content = Get-Content -Raw -LiteralPath $cssPath

if ($content -match '(--sidebar-accent:\s*)#[0-9A-Fa-f]{6}') {
  $content = $content -replace '(--sidebar-accent:\s*)#[0-9A-Fa-f]{6}', "`$1$hex"
} else {
  $content = $content -replace '(:root\s*\{)', "`$1`n  --sidebar-accent: $hex;"
}

# Build gradient string
$lightRgb = [int]::Parse($light.Substring(1,2), 'HexNumber'), [int]::Parse($light.Substring(3,2), 'HexNumber'), [int]::Parse($light.Substring(5,2), 'HexNumber')
$darkRgb = [int]::Parse($dark.Substring(1,2), 'HexNumber'), [int]::Parse($dark.Substring(3,2), 'HexNumber'), [int]::Parse($dark.Substring(5,2), 'HexNumber')
$newGradient = "linear-gradient(180deg, rgba($($lightRgb[0]), $($lightRgb[1]), $($lightRgb[2]), 0.98), rgba($($darkRgb[0]), $($darkRgb[1]), $($darkRgb[2]), 0.98))"

# Replace the first linear-gradient(...) occurrence inside .sidebar block if possible
$pattern = '(\.sidebar\s*\{[\s\S]*?background:\s*)linear-gradient\([\s\S]*?\);'
if ($content -match $pattern) {
  $content = [Regex]::Replace($content, $pattern, "`$1$newGradient;", 1)
} else {
  $content = $content + "`n/* auto-generated sidebar gradient */`n.sidebar { background: $newGradient; }`n"
}

Set-Content -LiteralPath $cssPath -Value $content -Encoding UTF8
Write-Host "Updated CSS with $hex and sidebar gradient."
Write-Host "Done. Open http://localhost:5000/admin/ and hard-refresh (Ctrl+Shift+R)."