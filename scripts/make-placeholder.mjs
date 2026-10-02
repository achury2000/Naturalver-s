import sharp from 'sharp';

const BRAND = '#273B52';
const LABEL = 'NATURALVER’S';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
  <rect width="800" height="800" fill="${BRAND}"/>
  <g fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="3">
    <rect x="250" y="290" width="300" height="220" rx="14"/>
    <path d="M250 430l90-80 70 62 60-48 80 66"/>
  </g>
  <circle cx="470" cy="350" r="22" fill="#ffffff" fill-opacity="0.35"/>
  <text x="400" y="590" font-family="Georgia, serif" font-size="34" fill="#ffffff" fill-opacity="0.75" text-anchor="middle">${LABEL}</text>
</svg>`;

await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toFile('public/placeholder-product.jpg');

console.log('public/placeholder-product.jpg creado');
