/**
 * Script per ottimizzazione immagini hero per Mobile
 * 
 * Requisiti: sharp (npm install sharp)
 * 
 * Uso: node optimize-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const MOBILE_WIDTH = 800; // Larghezza massima per mobile
const TABLET_WIDTH = 1200; // Larghezza per tablet
const QUALITY_WEBP = 85; // Qualità WebP (mobile)
const QUALITY_AVIF = 70; // Qualità AVIF (più aggressiva)

const images = [
    {
        input: 'thelizards/lizardsPhotos/theLizardsHome.webp',
        outputDir: 'thelizards/lizardsPhotos',
        baseName: 'theLizardsHome'
    },
    {
        input: '5cerealiz/5cerealizPhotos/5CerealizHome.webp',
        outputDir: '5cerealiz/5cerealizPhotos',
        baseName: '5CerealizHome'
    },
    {
        input: 'lizberries/lizberriesPhotos/theLizberriesHome.webp',
        outputDir: 'lizberries/lizberriesPhotos',
        baseName: 'theLizberriesHome'
    }
];

async function optimizeImage(imageConfig) {
    const { input, outputDir, baseName } = imageConfig;
    
    console.log(`\n📸 Ottimizzazione: ${baseName}`);
    
    try {
        // Verifica se il file esiste
        if (!fs.existsSync(input)) {
            console.error(`❌ File non trovato: ${input}`);
            return;
        }

        // Ottieni informazioni immagine originale
        const metadata = await sharp(input).metadata();
        console.log(`   Original: ${metadata.width}x${metadata.height} (${metadata.format})`);
        const originalSize = fs.statSync(input).size;
        console.log(`   Size: ${(originalSize / 1024).toFixed(2)} KB`);

        // 1. Mobile WebP (800px)
        const mobileWebpPath = path.join(outputDir, `${baseName}-mobile.webp`);
        await sharp(input)
            .resize(MOBILE_WIDTH, null, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: QUALITY_WEBP })
            .toFile(mobileWebpPath);
        
        const mobileWebpSize = fs.statSync(mobileWebpPath).size;
        const mobileWebpSavings = ((originalSize - mobileWebpSize) / originalSize * 100).toFixed(1);
        console.log(`   ✅ Mobile WebP: ${(mobileWebpSize / 1024).toFixed(2)} KB (-${mobileWebpSavings}%)`);

        // 2. Tablet WebP (1200px) - opzionale
        const tabletWebpPath = path.join(outputDir, `${baseName}-tablet.webp`);
        await sharp(input)
            .resize(TABLET_WIDTH, null, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: QUALITY_WEBP })
            .toFile(tabletWebpPath);
        
        const tabletWebpSize = fs.statSync(tabletWebpPath).size;
        const tabletWebpSavings = ((originalSize - tabletWebpSize) / originalSize * 100).toFixed(1);
        console.log(`   ✅ Tablet WebP: ${(tabletWebpSize / 1024).toFixed(2)} KB (-${tabletWebpSavings}%)`);

        // 3. Mobile AVIF (formato premium, -50% vs WebP)
        const mobileAvifPath = path.join(outputDir, `${baseName}-mobile.avif`);
        try {
            await sharp(input)
                .resize(MOBILE_WIDTH, null, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .avif({ quality: QUALITY_AVIF, effort: 6 })
                .toFile(mobileAvifPath);
            
            const mobileAvifSize = fs.statSync(mobileAvifPath).size;
            const avifSavings = ((originalSize - mobileAvifSize) / originalSize * 100).toFixed(1);
            console.log(`   🚀 Mobile AVIF: ${(mobileAvifSize / 1024).toFixed(2)} KB (-${avifSavings}%) [PREMIUM]`);
        } catch (avifError) {
            console.log(`   ⚠️  AVIF non supportato (richiede sharp compilato con libavif)`);
        }

        console.log(`   📊 Risparmio stimato mobile: ~${mobileWebpSavings}%`);

    } catch (error) {
        console.error(`❌ Errore durante l'ottimizzazione di ${baseName}:`, error.message);
    }
}

async function main() {
    console.log('🚀 Avvio ottimizzazione immagini hero per Mobile...\n');
    console.log('📌 Target:');
    console.log(`   - Mobile: ${MOBILE_WIDTH}px width`);
    console.log(`   - Tablet: ${TABLET_WIDTH}px width`);
    console.log(`   - WebP Quality: ${QUALITY_WEBP}%`);
    console.log(`   - AVIF Quality: ${QUALITY_AVIF}%`);

    // Verifica se sharp è installato
    try {
        require.resolve('sharp');
    } catch (e) {
        console.error('\n❌ Modulo "sharp" non trovato!');
        console.log('📦 Installalo con: npm install sharp\n');
        process.exit(1);
    }

    // Ottimizza tutte le immagini
    for (const imageConfig of images) {
        await optimizeImage(imageConfig);
    }

    console.log('\n✅ Ottimizzazione completata!');
    console.log('\n📝 Prossimi passi:');
    console.log('1. Verifica le immagini generate nella cartella di ogni sito');
    console.log('2. Aggiorna gli HTML con <picture> responsive');
    console.log('3. Testa le performance su PageSpeed Insights\n');
}

main().catch(console.error);
