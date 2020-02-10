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
        'LOGIN REQUIRED <form method="post" action="/login/submit"><input name="username" placeholder="username" /><input name="password" type="password" /><button type="submit">Login</button></form>'
      );
    });

    composer.addWebRoute(
      'post',
      '/login/submit',
      composer.passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' })
    );

    composer.addAllowedUrl('/login/submit');
    // composer.addAllowedUrl('/home');
    // composer.addAllowedUrl('/static/(.*)');
    // composer.addAllowedUrl('/api/projects/recent');
    // composer.addAllowedUrl('/api/assets/projectTemplates');
    // composer.addAllowedUrl('/api/projects/opened');

    composer.useUserSerializers(
      (user, done) => {
        console.log('SERIALIZE USER!');
        done(null, JSON.stringify(user));
      },
      (user, done) => {
        console.log('DESERIALIZE USER!');
        done(null, JSON.parse(user));
      }
    );
  },
};
