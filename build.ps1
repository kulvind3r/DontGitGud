# --- CONFIGURATION ---
$srcDir    = "src"
$buildDir  = "build"
$resDir    = "resources"
$indexFile = "index.html"
$targetFiles = @("script.js", "style.css", "favicon.png", "banner.png")

Write-Host "[BUILD] Starting build process..." -ForegroundColor Cyan
Write-Host "--------------------------------------------------"

# --- CLEAN & PREPARE BUILD DIRECTORIES ---
if (Test-Path $buildDir) {
    Write-Host "[CLEAN] Wiping existing '$buildDir' directory..."
    Remove-Item -Recurse -Force $buildDir | Out-Null
}
Write-Host "[DIR] Creating fresh '$buildDir' and '$buildDir/$resDir'..."
New-Item -ItemType Directory -Path "$buildDir/$resDir" | Out-Null

# --- COPY INDEX.HTML TO BUILD ---
$srcIndexPath = "$srcDir/$indexFile"
$buildIndexPath = "$buildDir/$indexFile"

if (-not (Test-Path $srcIndexPath)) {
    Write-Host "[ERROR] $indexFile not found in $srcDir!" -ForegroundColor Red
    Pause
    exit
}
Write-Host "[COPY] Copying $indexFile to $buildDir..."
Copy-Item $srcIndexPath $buildIndexPath

# --- PROCESS FINGERPRINTED ASSETS ---
Write-Host "[BUILD] Processing fingerprinted assets..."

foreach ($file in $targetFiles) {
    $srcPath = "$srcDir/$resDir/$file"
    
    if (Test-Path $srcPath) {
        $name = [System.IO.Path]::GetFileNameWithoutExtension($file)
        $ext  = [System.IO.Path]::GetExtension($file)
        
        # Generate 8-character SHA256 hash based on content
        $hash = (Get-FileHash $srcPath -Algorithm SHA256).Hash.Substring(0, 8).ToLower()
        $newFileName = "$name.$hash$ext"
        
        Write-Host "[PROCESS] $resDir/$file -> $resDir/$newFileName"
        Copy-Item $srcPath "$buildDir/$resDir/$newFileName"
        
        # Update references cleanly inside build/index.html
        $content = Get-Content $buildIndexPath -Raw
        $pattern = "$resDir/$name(\.[a-fA-F0-9]+)?$ext"
        $replacement = "$resDir/$newFileName"
        $content -replace $pattern, $replacement | Set-Content $buildIndexPath
    } else {
        Write-Host "[WARN] File not found: $srcPath - Skipping." -ForegroundColor Yellow
    }
}

Write-Host "--------------------------------------------------"
Write-Host "[BUILD] Production build created in '$buildDir'!" -ForegroundColor Green