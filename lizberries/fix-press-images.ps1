# ============================================
# Fix Press Images - Crea Thumbnails Separate
# ============================================

$cwebpPath = "C:\Users\mamonza\Downloads\Liz\LizHub\lizsito\ImmaginiConversione\cwebp.exe"
$backupDir = "backup_images_20260123_104037"
$pressDir = "lizberriesPhotos\pressImages"

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  FIX PRESS IMAGES - THUMBNAILS" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Verifica esistenza backup
if (-not (Test-Path $backupDir)) {
    Write-Host "ERRORE: Directory backup non trovata!" -ForegroundColor Red
    exit 1
}

# Lista press images
$pressImages = @(
    "limerick-post_01_2023.webp",
    "limerick-post_01_2024.webp",
    "limerick-post_06_2025.webp",
    "limerick-post_07_2025.webp",
    "web-lombardia_11_2024.webp",
    "la-repubblica_03_2025.webp",
    "la-stampa_03_2019.webp",
    "corriere-milano_03_2025.webp",
    "la-martesana_05_2024.webp"
)

Write-Host "[INFO] Ripristino immagini originali dal backup..." -ForegroundColor Yellow

foreach ($img in $pressImages) {
    $backupPath = Join-Path $backupDir $img
    $targetPath = Join-Path $pressDir $img
    
    if (Test-Path $backupPath) {
        # Ripristina immagine originale
        Copy-Item $backupPath $targetPath -Force
        
        # Crea thumbnail (200px) con suffisso _thumb
        $thumbPath = $targetPath -replace '\.webp$', '_thumb.webp'
        
        $args = @(
            "-resize", "200", "0",
            "-q", "80",
            "-m", "6",
            "-mt",
            $targetPath,
            "-o", $thumbPath
        )
        
        & $cwebpPath $args 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            $origSize = (Get-Item $targetPath).Length / 1KB
            $thumbSize = (Get-Item $thumbPath).Length / 1KB
            Write-Host "  [OK] $img" -ForegroundColor Green
            Write-Host "       Full: $([math]::Round($origSize, 1)) KB | Thumb: $([math]::Round($thumbSize, 1)) KB" -ForegroundColor Gray
        }
    } else {
        Write-Host "  [SKIP] $img - backup non trovato" -ForegroundColor Yellow
    }
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  COMPLETATO!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "`nOra aggiorna index.js per usare i thumbnails nella preview.`n" -ForegroundColor Yellow
