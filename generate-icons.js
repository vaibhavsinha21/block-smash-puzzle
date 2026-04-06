// Quick SVG-based icon generator — creates PNG-like SVGs for PWA
const fs = require('fs');

const svg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a4e"/>
      <stop offset="100%" style="stop-color:#0a0a2e"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size*0.15}" fill="url(#bg)"/>
  <rect x="${size*0.15}" y="${size*0.15}" width="${size*0.25}" height="${size*0.25}" rx="${size*0.03}" fill="#ff6b6b"/>
  <rect x="${size*0.42}" y="${size*0.15}" width="${size*0.25}" height="${size*0.25}" rx="${size*0.03}" fill="#ffd93d"/>
  <rect x="${size*0.15}" y="${size*0.42}" width="${size*0.25}" height="${size*0.25}" rx="${size*0.03}" fill="#6bcb77"/>
  <rect x="${size*0.42}" y="${size*0.42}" width="${size*0.25}" height="${size*0.25}" rx="${size*0.03}" fill="#4d96ff"/>
  <rect x="${size*0.69}" y="${size*0.15}" width="${size*0.18}" height="${size*0.52}" rx="${size*0.03}" fill="#a855f7"/>
  <rect x="${size*0.15}" y="${size*0.69}" width="${size*0.52}" height="${size*0.18}" rx="${size*0.03}" fill="#f97316"/>
  <text x="${size*0.5}" y="${size*0.97}" text-anchor="middle" font-size="${size*0.06}" fill="white" font-family="system-ui" font-weight="800" opacity="0.6">BLOCK SMASH</text>
</svg>`;

// Save as SVG (browsers handle SVG icons fine for PWA)
fs.writeFileSync('public/icon-192.svg', svg(192));
fs.writeFileSync('public/icon-512.svg', svg(512));

// For actual PNG, we'll just use the SVG - modern browsers support it
// For production, use sharp or canvas to convert
console.log('✅ Icons generated');
