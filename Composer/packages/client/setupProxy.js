const proxy = require('http-proxy-middleware');

const paths = require('./config/paths');
const proxySetting = require(paths.appPackageJson).proxy;

module.exports = function (app) {
  const wsProxy = proxy(['/lg-language-server', '/lu-language-server', '/intellisense-language-server'], {
    target: proxySetting.replace('/^http/', 'ws'),
    changeOrigin: true,
    ws: true,
  });

  app.use(wsProxy);
};
