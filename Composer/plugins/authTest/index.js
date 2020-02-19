// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const LocalStrategy = require('passport-local').Strategy;

module.exports = {
  initialize: composer => {
    console.log('Register auth plugin');

    composer.usePassportStrategy(
      new LocalStrategy(function(username, password, done) {
        if (username === 'admin' && password === 'secret') {
          done(null, {
            name: 'admin',
            id: 1,
            roles: ['a', 'b', 'c'],
          });
        } else {
          done(null, false, { message: 'Incorrect password' });
        }
      })
    );

    // define this BEFORE turning on the middleware...
    composer.addWebRoute('get', '/login', (req, res) => {
      res.send(
        'LOGIN REQUIRED <form method="post" action="/login/submit"><input name="username" placeholder="username" value="admin" /><input name="password" type="password" value="secret" /><button type="submit">Login</button></form>'
      );
    });

    composer.addWebRoute(
      'post',
      '/login/submit',
      composer.passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' })
    );

    composer.addAllowedUrl('/login/submit');
  },
};
