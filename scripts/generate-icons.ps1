# Generates the PWA PNG icons from the same palette as public/favicon.svg.
# Run:  powershell -ExecutionPolicy Bypass -File scripts/generate-icons.ps1
# Requires: Windows PowerShell 5+ (System.Drawing, ships with Windows).

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root "public\icons"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

$emerald = [System.Drawing.Color]::FromArgb(255, 16, 185, 129)
$teal    = [System.Drawing.Color]::FromArgb(255, 20, 184, 166)

function New-IconCanvas([int]$size) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = "AntiAlias"
    $g.TextRenderingHint = "AntiAliasGridFit"
    $g.PixelOffsetMode = "HighQuality"
    return @{ Bmp = $bmp; G = $g }
}

function Fill-Gradient($g, [int]$size, [bool]$rounded) {
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $emerald, $teal, 45)

    if ($rounded) {
        $r = [int]($size * 0.22)
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddArc(0, 0, 2 * $r, 2 * $r, 180, 90)
        $path.AddArc($size - 2 * $r, 0, 2 * $r, 2 * $r, 270, 90)
        $path.AddArc($size - 2 * $r, $size - 2 * $r, 2 * $r, 2 * $r, 0, 90)
        $path.AddArc(0, $size - 2 * $r, 2 * $r, 2 * $r, 90, 90)
        $path.CloseFigure()
        $g.FillPath($brush, $path)
        $path.Dispose()
    } else {
        $g.FillRectangle($brush, $rect)
    }
    $brush.Dispose()
}

# $contentScale: 0.42 for regular icons, 0.28 for maskable (keeps the mark
# inside the 80% safe zone once a launcher crops it into a circle/squircle).
function New-Icon([int]$size, [string]$fileName, [bool]$rounded, [double]$contentScale) {
    $canvas = New-IconCanvas $size
    $bmp = $canvas.Bmp
    $g = $canvas.G

    Fill-Gradient $g $size $rounded

    $fontSize = [float]($size * $contentScale)
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = "Center"
    $fmt.LineAlignment = "Center"

    $g.DrawString("Rs.", $font, [System.Drawing.Brushes]::White, (New-Object System.Drawing.RectangleF(0, 0, $size, $size)), $fmt)

    $font.Dispose()
    $fmt.Dispose()
    $g.Dispose()

    $file = Join-Path $outDir $fileName
    $bmp.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "wrote $file"
}

New-Icon 192 "icon-192.png"     $true  0.42
New-Icon 512 "icon-512.png"     $true  0.42
New-Icon 512 "maskable-512.png" $false 0.28
New-Icon 180 "apple-touch-icon-180.png" $false 0.40

Write-Host "done"
