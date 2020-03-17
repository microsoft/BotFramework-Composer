// license???

const chalk = require('react-dev-utils/chalk');
const fs = require('fs-extra');
const path = require('path');

const paths = require('../config/paths');

// copy to electron-server
console.log(chalk.cyan('[@bfc/client] Copying /build/public to electron-server/dist/public...'));
fs.copySync(paths.appBuild, path.join(paths.appDistElectron, 'public'));

console.log(chalk.cyan('[@bfc/client] Done'));
