const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting minification process...\n');

// File da minificare
const files = [
    { type: 'css', src: 'css/liz.css', dest: 'css/liz.min.css' },
    { type: 'js', src: 'index.js', dest: 'index.min.js' },
    { type: 'js', src: '5cerealiz/index.js', dest: '5cerealiz/index.min.js' },
    { type: 'js', src: 'lizberries/index.js', dest: 'lizberries/index.min.js' }
];

let totalSaved = 0;

files.forEach(file => {
    const srcPath = path.join(__dirname, file.src);
    const destPath = path.join(__dirname, file.dest);
    
    if (!fs.existsSync(srcPath)) {
        console.log(`⚠️  Skipping ${file.src} - file not found`);
        return;
    }

    const originalSize = fs.statSync(srcPath).size;
    
    try {
        if (file.type === 'css') {
            // Minifica CSS
            execSync(`npx cleancss -o "${destPath}" "${srcPath}"`, { stdio: 'inherit' });
        } else if (file.type === 'js') {
            // Minifica JS
            execSync(`npx terser "${srcPath}" -o "${destPath}" --compress --mangle`, { stdio: 'inherit' });
        }
        
        const minifiedSize = fs.statSync(destPath).size;
        const saved = originalSize - minifiedSize;
        const percentage = ((saved / originalSize) * 100).toFixed(2);
        
        totalSaved += saved;
        
        console.log(`✅ ${file.src}`);
        console.log(`   Original: ${(originalSize / 1024).toFixed(2)} KB`);
        console.log(`   Minified: ${(minifiedSize / 1024).toFixed(2)} KB`);
        console.log(`   Saved: ${(saved / 1024).toFixed(2)} KB (${percentage}%)\n`);
        
    } catch (error) {
        console.error(`❌ Error minifying ${file.src}:`, error.message);
    }
});

console.log(`\n🎉 Total saved: ${(totalSaved / 1024).toFixed(2)} KB`);
console.log('\n📝 Next steps:');
console.log('1. Test the minified files locally');
console.log('2. Update HTML files to use .min.css and .min.js versions');
console.log('3. Deploy to production');
