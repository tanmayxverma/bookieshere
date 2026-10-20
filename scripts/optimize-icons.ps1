Add-Type -AssemblyName System.Drawing

$src = Join-Path $PSScriptRoot "..\public\logo.png"
$srcBmp = [System.Drawing.Bitmap]::new($src)

# 32x32 Favicon
$favBmp = [System.Drawing.Bitmap]::new(32, 32)
$g1 = [System.Drawing.Graphics]::FromImage($favBmp)
$g1.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g1.DrawImage($srcBmp, 0, 0, 32, 32)
$favBmp.Save((Join-Path $PSScriptRoot "..\public\favicon-32x32.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g1.Dispose()
$favBmp.Dispose()

# 180x180 Apple Touch Icon
$appleBmp = [System.Drawing.Bitmap]::new(180, 180)
$g2 = [System.Drawing.Graphics]::FromImage($appleBmp)
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.DrawImage($srcBmp, 0, 0, 180, 180)
$appleBmp.Save((Join-Path $PSScriptRoot "..\public\apple-touch-icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g2.Dispose()
$appleBmp.Dispose()

$srcBmp.Dispose()
Write-Output "Optimized icons generated successfully."
