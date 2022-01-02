const { copySync } = require('fs-extra');
const { join } = require('path');

console.log(`Copying web/ directory to server dist folder.`);

copySync(join(__dirname, 'web'), join(__dirname, 'dist', 'server', 'web'));