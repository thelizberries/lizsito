# ============================================
# Ottimizzazione Latest Band Photos - Thumbnails
# ============================================

$cwebpPath = "C:\Users\mamonza\Downloads\Liz\LizHub\lizsito\ImmaginiConversione\cwebp.exe"
$carouselDir = "lizberriesPhotos\photo_carousel"

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  OTTIMIZZAZIONE LATEST BAND PHOTOS" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Verifica esistenza cwebp.exe
if (-not (Test-Path $cwebpPath)) {
    Write-Host "ERRORE: cwebp.exe non trovato in $cwebpPath" -ForegroundColor Red
    exit 1
}

# Crea directory backup se non esiste
$backupDir = "backup_images_20260123_104037"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

Write-Host "[INFO] Creazione thumbnails per Latest Band Photos (carousel)..." -ForegroundColor Yellow
Write-Host "[INFO] Preview: 200px | Popup: Full-size originale`n" -ForegroundColor Cyan

$totalOriginal = 0
$totalThumb = 0
$count = 0

# Processa tutte le immagini nella directory
Get-ChildItem "$carouselDir\*.webp" | Where-Object { $_.Name -notmatch '_thumb' } | ForEach-Object {
    $originalPath = $_.FullName
    $thumbPath = $originalPath -replace '\.webp$', '_thumb.webp'
    
    # Backup se non esiste già
    $backupPath = Join-Path $backupDir $_.Name
    if (-not (Test-Path $backupPath)) {
        Copy-Item $originalPath $backupPath -Force
    }
    
    # Crea thumbnail solo se non esiste già
    if (-not (Test-Path $thumbPath)) {
        $args = @(
            "-resize", "200", "0",  # 200px width per carousel
            "-q", "80",
            "-m", "6",
            "-mt",
            $originalPath,
            "-o", $thumbPath
        )
        
        & $cwebpPath $args 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            $origSize = (Get-Item $originalPath).Length / 1KB
            $thumbSize = (Get-Item $thumbPath).Length / 1KB
            $savings = [math]::Round((($origSize - $thumbSize) / $origSize) * 100, 1)
            
            $totalOriginal += $origSize
            $totalThumb += $thumbSize
            $count++
            
            Write-Host "  [OK] $($_.Name)" -ForegroundColor Green
            Write-Host "       Full: $([math]::Round($origSize, 1)) KB | Thumb: $([math]::Round($thumbSize, 1)) KB ($savings% risparmio)" -ForegroundColor Gray
        }
    } else {
        Write-Host "  [SKIP] $($_.Name) - thumbnail già esistente" -ForegroundColor Yellow
    }
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  COMPLETATO!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan

if ($count -gt 0) {
    $totalSavings = [math]::Round((($totalOriginal - $totalThumb) / $totalOriginal) * 100, 1)
    Write-Host "`nStatistiche:" -ForegroundColor Cyan
    Write-Host "  Immagini processate: $count" -ForegroundColor White
    Write-Host "  Dimensione originale totale: $([math]::Round($totalOriginal, 1)) KB" -ForegroundColor Yellow
    Write-Host "  Dimensione thumbnails totale: $([math]::Round($totalThumb, 1)) KB" -ForegroundColor Green
    Write-Host "  Risparmio totale: $([math]::Round($totalOriginal - $totalThumb, 1)) KB ($totalSavings%)" -ForegroundColor Cyan
}

Write-Host "`nOra aggiorna index.js per usare la logica thumb/full-size.`n" -ForegroundColor Yellow
