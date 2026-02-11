# ============================================
# Script di Ottimizzazione Immagini - The Lizberries
# Utilizza cwebp.exe per ridimensionare e ottimizzare
# ============================================

$cwebpPath = "C:\Users\mamonza\Downloads\Liz\LizHub\lizsito\ImmaginiConversione\cwebp.exe"
$photoDir = "lizberriesPhotos"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  OTTIMIZZAZIONE IMMAGINI - THE LIZBERRIES" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Verifica esistenza cwebp.exe
if (-not (Test-Path $cwebpPath)) {
    Write-Host "ERRORE: cwebp.exe non trovato in $cwebpPath" -ForegroundColor Red
    exit 1
}

# Crea directory backup
$backupDir = "backup_images_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "[INFO] Creazione backup in: $backupDir" -ForegroundColor Yellow
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# ============================================
# FUNZIONE: Ottimizza e ridimensiona immagine
# ============================================
function Optimize-Image {
    param(
        [string]$InputPath,
        [string]$OutputPath,
        [int]$Width,
        [int]$Quality = 85
    )
    
    if (-not (Test-Path $InputPath)) {
        Write-Host "  [SKIP] File non trovato: $InputPath" -ForegroundColor Yellow
        return $false
    }
    
    # Backup originale
    $backupPath = Join-Path $backupDir (Split-Path $InputPath -Leaf)
    Copy-Item $InputPath $backupPath -Force
    
    # Ottimizza con cwebp
    $args = @(
        "-resize", $Width, "0",  # Ridimensiona mantenendo aspect ratio
        "-q", $Quality,           # Qualità
        "-m", "6",                # Metodo compressione (0-6, 6 è più lento ma migliore)
        "-mt",                    # Multi-threading
        $InputPath,
        "-o", $OutputPath
    )
    
    Write-Host "  [PROCESSING] $(Split-Path $InputPath -Leaf) -> ${Width}px" -ForegroundColor Green
    
    & $cwebpPath $args 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        $originalSize = (Get-Item $InputPath).Length / 1KB
        $newSize = (Get-Item $OutputPath).Length / 1KB
        $savings = $originalSize - $newSize
        $savingsPercent = [math]::Round(($savings / $originalSize) * 100, 1)
        
        Write-Host "  [SUCCESS] ${originalSize} KB -> ${newSize} KB (risparmiati: ${savingsPercent}%)" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  [ERROR] Errore durante l'ottimizzazione" -ForegroundColor Red
        return $false
    }
}

# ============================================
# 1. PRIORITÀ MASSIMA: img-bio.webp
# ============================================
Write-Host "`n[1/5] Ottimizzazione img-bio.webp (4032x3024 -> 800px)" -ForegroundColor Cyan
Optimize-Image -InputPath "$photoDir\img-bio.webp" -OutputPath "$photoDir\img-bio.webp" -Width 800 -Quality 82

# ============================================
# 2. BACKGROUND LIVE (PNG -> WebP responsive)
# ============================================
Write-Host "`n[2/5] Conversione background-lizberries-live.png -> WebP responsive" -ForegroundColor Cyan

if (Test-Path "$photoDir\background-lizberries-live.png") {
    # Mobile (600px)
    Optimize-Image -InputPath "$photoDir\background-lizberries-live.png" `
                   -OutputPath "$photoDir\background-lizberries-live-mobile.webp" `
                   -Width 600 -Quality 80
    
    # Tablet (1200px)
    Optimize-Image -InputPath "$photoDir\background-lizberries-live.png" `
                   -OutputPath "$photoDir\background-lizberries-live-tablet.webp" `
                   -Width 1200 -Quality 82
    
    # Desktop (1920px)
    Optimize-Image -InputPath "$photoDir\background-lizberries-live.png" `
                   -OutputPath "$photoDir\background-lizberries-live.webp" `
                   -Width 1920 -Quality 85
    
    Write-Host "  [INFO] Puoi eliminare il PNG originale dopo il test" -ForegroundColor Yellow
}

# ============================================
# 3. HERO IMAGE MOBILE
# ============================================
Write-Host "`n[3/5] Ottimizzazione theLizberriesHome-mobile.webp (800 -> 500px)" -ForegroundColor Cyan
Optimize-Image -InputPath "$photoDir\theLizberriesHome-mobile.webp" `
               -OutputPath "$photoDir\theLizberriesHome-mobile.webp" `
               -Width 500 -Quality 85

# ============================================
# 4. POSTER TOUR (stpatricks, irlanda, etc.)
# ============================================
Write-Host "`n[4/5] Ottimizzazione poster tour" -ForegroundColor Cyan

$tourPosters = @(
    @{File="stpatricks_UK_2026.webp"; Width=500},
    @{File="irlanda2026.webp"; Width=500},
    @{File="tfroyal_Queen_Of_Limerick.webp"; Width=500},
    @{File="Guanella_17_01_2026.webp"; Width=500}
)

foreach ($poster in $tourPosters) {
    if (Test-Path "$photoDir\$($poster.File)") {
        Optimize-Image -InputPath "$photoDir\$($poster.File)" `
                       -OutputPath "$photoDir\$($poster.File)" `
                       -Width $poster.Width -Quality 82
    }
}

# ============================================
# 5. PRESS IMAGES
# ============================================
Write-Host "`n[5/5] Ottimizzazione Press Images" -ForegroundColor Cyan

$pressImages = @(
    "limerick-post_06_2025.webp",
    "limerick-post_01_2023.webp",
    "limerick-post_01_2024.webp",
    "limerick-post_07_2025.webp",
    "la-repubblica_03_2025.webp",
    "corriere-milano_03_2025.webp",
    "web-lombardia_11_2024.webp",
    "la-stampa_03_2019.webp",
    "la-martesana_05_2024.webp"
)

foreach ($img in $pressImages) {
    if (Test-Path "$photoDir\pressImages\$img") {
        Optimize-Image -InputPath "$photoDir\pressImages\$img" `
                       -OutputPath "$photoDir\pressImages\$img" `
                       -Width 200 -Quality 80
    }
}

# ============================================
# 6. LOGO (opzionale)
# ============================================
Write-Host "`n[BONUS] Ottimizzazione logo_titolo.webp" -ForegroundColor Cyan
if (Test-Path "$photoDir\logo_titolo.webp") {
    Optimize-Image -InputPath "$photoDir\logo_titolo.webp" `
                   -OutputPath "$photoDir\logo_titolo.webp" `
                   -Width 500 -Quality 85
}

# ============================================
# RIEPILOGO FINALE
# ============================================
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  OTTIMIZZAZIONE COMPLETATA!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "`nBackup originali salvati in: $backupDir" -ForegroundColor Yellow
Write-Host "`nPROSSIMI PASSI:" -ForegroundColor Cyan
Write-Host "1. Testa il sito localmente" -ForegroundColor White
Write-Host "2. Se tutto funziona, esegui lo script HTML update" -ForegroundColor White
Write-Host "3. Ricontrolla PageSpeed Insights" -ForegroundColor White
Write-Host "4. Se i risultati sono buoni, elimina il backup`n" -ForegroundColor White

# Calcola risparmio totale
$totalOriginal = (Get-ChildItem $backupDir -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
$totalNew = (Get-ChildItem $photoDir -Recurse -File -Include *.webp | Measure-Object -Property Length -Sum).Sum / 1MB
$totalSavings = $totalOriginal - $totalNew
$savingsPercent = if($totalOriginal -gt 0) { [math]::Round(($totalSavings / $totalOriginal) * 100, 1) } else { 0 }

Write-Host "RISPARMIO TOTALE STIMATO:" -ForegroundColor Green
Write-Host "  Prima: $([math]::Round($totalOriginal, 2)) MB" -ForegroundColor Yellow
Write-Host "  Dopo: $([math]::Round($totalNew, 2)) MB" -ForegroundColor Green
Write-Host "  Risparmiati: $([math]::Round($totalSavings, 2)) MB ($savingsPercent%)`n" -ForegroundColor Cyan
