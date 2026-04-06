/**
 * Store Asset Generator for Block Smash Puzzle
 * Run: node assets/generate-store-assets.js
 *
 * This creates all required icon sizes for:
 * - Google Play Store
 * - Apple App Store
 * - Android adaptive icons
 * - iOS app icons
 *
 * For production, install `sharp` to convert SVG → PNG:
 *   npm install sharp
 *
 * OR use Capacitor Assets plugin (recommended):
 *   npx @capacitor/assets generate
 *   Place a 1024x1024 icon.png in /assets/ first.
 */

const fs = require('fs');
const path = require('path');

// Create SVG master icon at 1024x1024
function createMasterIcon(size = 1024) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a4e"/>
      <stop offset="100%" style="stop-color:#0a0a2e"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="${size}" height="${size}" rx="${size*0.18}" fill="url(#bg)"/>
  <!-- Block grid -->
  <rect x="${size*0.12}" y="${size*0.10}" width="${size*0.24}" height="${size*0.24}" rx="${size*0.03}" fill="#ff6b6b" filter="url(#glow)"/>
  <rect x="${size*0.38}" y="${size*0.10}" width="${size*0.24}" height="${size*0.24}" rx="${size*0.03}" fill="#ffd93d" filter="url(#glow)"/>
  <rect x="${size*0.64}" y="${size*0.10}" width="${size*0.24}" height="${size*0.24}" rx="${size*0.03}" fill="#a855f7" filter="url(#glow)"/>
  <rect x="${size*0.12}" y="${size*0.36}" width="${size*0.24}" height="${size*0.24}" rx="${size*0.03}" fill="#6bcb77" filter="url(#glow)"/>
  <rect x="${size*0.38}" y="${size*0.36}" width="${size*0.24}" height="${size*0.24}" rx="${size*0.03}" fill="#4d96ff" filter="url(#glow)"/>
  <rect x="${size*0.64}" y="${size*0.36}" width="${size*0.24}" height="${size*0.24}" rx="${size*0.03}" fill="#f97316" filter="url(#glow)"/>
  <rect x="${size*0.12}" y="${size*0.62}" width="${size*0.50}" height="${size*0.24}" rx="${size*0.03}" fill="#06b6d4" filter="url(#glow)"/>
  <rect x="${size*0.64}" y="${size*0.62}" width="${size*0.24}" height="${size*0.24}" rx="${size*0.03}" fill="#ec4899" filter="url(#glow)"/>
  <!-- Title -->
  <text x="${size*0.5}" y="${size*0.95}" text-anchor="middle" font-size="${size*0.058}" fill="white" font-family="system-ui,-apple-system,sans-serif" font-weight="900" letter-spacing="${size*0.003}">BLOCK SMASH</text>
</svg>`;
}

// Create splash screen SVG
function createSplash(w = 2732, h = 2732) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a2e"/>
      <stop offset="50%" style="stop-color:#151545"/>
      <stop offset="100%" style="stop-color:#0d0d3d"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <text x="${w/2}" y="${h/2}" text-anchor="middle" dominant-baseline="middle"
    font-size="120" fill="white" font-family="system-ui,-apple-system,sans-serif"
    font-weight="900" letter-spacing="2">
    <tspan fill="#ff6b6b">B</tspan><tspan fill="#ffd93d">L</tspan><tspan fill="#6bcb77">O</tspan><tspan fill="#4d96ff">C</tspan><tspan fill="#a855f7">K</tspan>
    <tspan fill="white"> SMASH</tspan>
  </text>
</svg>`;
}

// Write assets
const assetsDir = path.join(__dirname);
fs.writeFileSync(path.join(assetsDir, 'icon.svg'), createMasterIcon(1024));
fs.writeFileSync(path.join(assetsDir, 'icon-foreground.svg'), createMasterIcon(1024));
fs.writeFileSync(path.join(assetsDir, 'splash.svg'), createSplash());
fs.writeFileSync(path.join(assetsDir, 'splash-dark.svg'), createSplash());

// Also create for public folder
const publicDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
[16, 32, 48, 72, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512, 1024].forEach(size => {
  fs.writeFileSync(path.join(publicDir, `icon-${size}.svg`), createMasterIcon(size));
});

console.log('✅ All store assets generated in /assets/ and /public/icons/');
console.log('');
console.log('📱 For PNG conversion (needed for stores), either:');
console.log('   1. Use Capacitor Assets: npx @capacitor/assets generate');
console.log('      (place a 1024x1024 icon.png in /assets/)');
console.log('   2. Use an SVG → PNG converter online');
console.log('   3. Install sharp: npm install sharp && add conversion code');
