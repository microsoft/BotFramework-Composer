// license???

const fs = require('fs-extra');
const path = require('path');

const assetsPath = path.join(__dirname, '../assets');
const electronDistPath = path.join(__dirname, '../../electron-server/dist/assets');

console.log('[@bfc/server] Copying assets to Electron dist folder...');
fs.copySync(assetsPath, electronDistPath);
console.log('[@bfc/server] Done.');
