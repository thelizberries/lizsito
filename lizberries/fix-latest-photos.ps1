# Fix index.min.js - Rimuovi replace da loadImages mantenendolo in loadPressImages

$filePath = "index.min.js"
$content = Get-Content $filePath -Raw

Write-Host "Fix Latest Band Photos..." -ForegroundColor Cyan

# Pattern PRIMA (errato): nella funzione loadImages c'è il replace
$oldPattern = 'src="\$\{o\.replace\(''\.webp'',''_thumb\.webp''\)\}\\"'

# Pattern DOPO (corretto): src normale senza replace
$newPattern = 'src="${o}"'

# Sostituisci SOLO nella parte di loadImages (prima occorrenza)
$parts = $content -split 'function loadPressImages', 2

if ($parts.Count -eq 2) {
    # Modifica solo la prima parte (loadImages)
    $parts[0] = $parts[0] -replace [regex]::Escape($oldPattern), $newPattern
    
    # Ricomponi il file
    $content = $parts[0] + 'function loadPressImages' + $parts[1]
    
    Set-Content -Path $filePath -Value $content -NoNewline
    Write-Host "[OK] Latest Band Photos ora funzionante!" -ForegroundColor Green
    Write-Host "[OK] Press Images mantiene i thumbnails" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Pattern non trovato" -ForegroundColor Red
}
