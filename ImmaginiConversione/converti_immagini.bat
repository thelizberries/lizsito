@echo off
setlocal enabledelayedexpansion

:: Percorso della cartella corrente
set "srcDir=%cd%"
set "quality=80"

:: Path agli eseguibili (nella stessa cartella)
set "cwebpExe=%srcDir%\cwebp.exe"
set "avifencExe=%srcDir%\avifenc.exe"

:: Crea cartelle di output
mkdir "%srcDir%\output-webp" 2>nul
mkdir "%srcDir%\output-avif" 2>nul

echo Inizio conversione...

for %%f in (*.jpg *.jpeg *.png) do (
    set "filename=%%~nf"

    echo Convertendo %%f in WebP...
    "%cwebpExe%" -q %quality% "%%f" -o "output-webp\!filename!.webp"

    ::echo Convertendo %%f in AVIF...
    ::"%avifencExe%" --min %quality% --max %quality% "%%f" "output-avif\!filename!.avif"
)

echo Conversione completata!
pause
