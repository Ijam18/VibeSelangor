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

// SVG source — inline for maximum control
const svgSource = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#CE1126"/>
      <stop offset="100%" stop-color="#7f0d18"/>
    </linearGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="60%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Background with rounded corners (maskable safe zone) -->
  <rect width="512" height="512" fill="url(#bg)" rx="96"/>

  <!-- Subtle shine overlay -->
  <rect width="512" height="512" fill="url(#shine)" rx="96"/>

  <!-- Lightning bolt — centered, bold -->
  <path
    d="M280 60 L160 280 L220 280 L200 450 L360 220 L300 220 Z"
    fill="#FFD700"
    stroke="#000"
    stroke-width="12"
    stroke-linejoin="round"
    filter="url(#shadow)"
  />

  <!-- Inner highlight on bolt -->
  <path
    d="M280 60 L160 280 L220 280 L200 450 L360 220 L300 220 Z"
    fill="url(#shine)"
    opacity="0.4"
  />
</svg>`;

const sizes = [
    { size: 192, name: 'icon-192.png' },
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
