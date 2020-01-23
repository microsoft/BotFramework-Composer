// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

module.exports = {
  initialize: composer => {

    console.log('Register web route middleware');

    composer.addWebMiddleware((req, res, next) => {
      console.log('WEB HIT TO COMPOSER', req.url);
      next();
    });

    composer.addWebRoute('get', '/toot', (req, res) => {
      res.send('TOOT!');
    });
  },
};
