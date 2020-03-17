// license???

const fs = require('fs-extra');
const path = require('path');

const distDir = path.join(__dirname, '../dist');

if (fs.existsSync(distDir)) {
  // clean dist folder
  console.log('[electron-server] Cleaning electron dist directory...');
  fs.emptyDirSync(distDir);
} else {
  // create dist folder
  console.log('[electron-server] Creating new electron dist directory...');
  fs.mkdirpSync(distDir);
}

// copy the bot templates
console.log('[electron-server] Copying bot templates to dist directory...');
fs.copySync(path.resolve(__dirname, '../../../../BotProject/Templates'), path.join(distDir, 'templates'));

console.log('[electron-server] Done...');
