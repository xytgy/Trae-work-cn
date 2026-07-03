const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = path.join(__dirname, '..');
const distDir = path.join(__dirname, '..', 'dist');

function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);

    for (const file of files) {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);

        if (fs.statSync(srcPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== '.trae') {
                copyDirectory(srcPath, destPath);
            }
        } else {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied: ${srcPath}`);
        }
    }
}

console.log('Building project...');

if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
    console.log('Cleaned existing dist directory');
}

copyDirectory(srcDir, distDir);

console.log('Build completed!');
console.log(`Output: ${distDir}`);