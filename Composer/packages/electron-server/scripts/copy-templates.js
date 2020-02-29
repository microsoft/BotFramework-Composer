const fs = require('fs-extra');
const path = require('path');

fs.copy(path.resolve(__dirname, '../../../../BotProject/Templates'), path.resolve(__dirname, '../build/templates'));
