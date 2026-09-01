Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('public\hero3.png')
$x = [int]($img.Width / 2)
$y = [int]($img.Height / 2)
$pixel = $img.GetPixel($x, $y)
Write-Output "Center Pixel: $($pixel.R), $($pixel.G), $($pixel.B)"
$pixel2 = $img.GetPixel(10, 10)
Write-Output "Top Left Pixel: $($pixel2.R), $($pixel2.G), $($pixel2.B)"
