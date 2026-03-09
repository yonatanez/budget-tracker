// Generate a 180x180 PNG icon with a dollar emoji using Canvas API
// Run with: node generate-icon.js

import { writeFileSync } from 'fs';

// Create a minimal PNG with a green background and $ symbol
// Since we can't use Canvas in plain Node, we'll create a base64-encoded PNG manually
// Using a data URI approach - create an HTML file that generates the icon

const html = `<!DOCTYPE html>
<html>
<body>
<canvas id="c" width="180" height="180"></canvas>
<script>
const c = document.getElementById('c');
const ctx = c.getContext('2d');

// Green rounded background
ctx.fillStyle = '#2e7d32';
ctx.beginPath();
ctx.roundRect(0, 0, 180, 180, 30);
ctx.fill();

// Dollar sign
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 120px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('$', 90, 95);

// Download
const link = document.createElement('a');
link.download = 'icon-180.png';
link.href = c.toDataURL('image/png');
link.click();
</script>
</body>
</html>`;

writeFileSync('docs/generate-icon.html', html);
console.log('Open docs/generate-icon.html in your browser to download the icon PNG');
