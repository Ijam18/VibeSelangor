/**
 * generate-icons.mjs
 * Generates high-quality PWA icons from the SVG source using sharp.
 * Run: node scripts/generate-icons.mjs
 */

import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const iconsDir = join(rootDir, 'public', 'icons');

// Ensure icons directory exists
mkdirSync(iconsDir, { recursive: true });

// Read the actual VibeSelangor logo
const logoPath = join(rootDir, 'public', 'selangor-parlimen.svg');
const svgSource = readFileSync(logoPath, 'utf8');

const sizes = [
  { size: 72, name: 'icon-72.png' },
  { size: 96, name: 'icon-96.png' },
  { size: 128, name: 'icon-128.png' },
  { size: 144, name: 'icon-144.png' },
  { size: 152, name: 'icon-152.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 384, name: 'icon-384.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },  // iOS
  { size: 32, name: 'favicon-32.png' },
  { size: 16, name: 'favicon-16.png' },
];

console.log('🎨 Generating VibeSelangor PWA icons...\n');

for (const { size, name } of sizes) {
  const outputPath = join(iconsDir, name);
  await sharp(Buffer.from(svgSource))
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(outputPath);
  console.log(`  ✅ ${name} (${size}×${size})`);
}

// Also copy apple-touch-icon to public root
const appleTouchSrc = join(iconsDir, 'apple-touch-icon.png');
const appleTouchDest = join(rootDir, 'public', 'apple-touch-icon.png');
readFileSync(appleTouchSrc); // verify it exists
import { copyFileSync } from 'fs';
copyFileSync(appleTouchSrc, appleTouchDest);
console.log(`  ✅ apple-touch-icon.png → public/`);

console.log('\n🚀 All icons generated successfully!');
console.log('📁 Location: public/icons/');
