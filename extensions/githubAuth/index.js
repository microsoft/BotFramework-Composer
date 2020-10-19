// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const GitHubStrategy = require('passport-github').Strategy;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, BASE_URL } = require('./config.json');

module.exports = {
  initialize: composer => {
    console.log('Register github auth plugin');

    composer.usePassportStrategy(
      new GitHubStrategy(
        {
          clientID: GITHUB_CLIENT_ID,
          clientSecret: GITHUB_CLIENT_SECRET,
          callbackURL: `${ BASE_URL }/auth/github/callback`,
        },
        function(accessToken, refreshToken, profile, cb) {
          return cb(null, {
            id: profile.id,
            token: accessToken,
            profile: profile,
          });
        }
      )
    );

    // define this BEFORE turning on the middleware...
    composer.addWebRoute('get', '/login', (req, res) => {
      res.send('LOGIN REQUIRED! <a href="/auth/github">LOGIN WITH GITHUB HERE</a>')
    });

    composer.addWebRoute('get','/auth/github', composer.passport.authenticate('github'));
    composer.addWebRoute('get', '/logout', (req, res) => {
      req.logout();
      res.redirect('/')
    });

    composer.addWebRoute(
      'get',
      '/auth/github/callback',
      composer.passport.authenticate('github', { failureRedirect: '/login' }),
      function(req, res) {
        console.log('login complete!');
        // Successful authentication, redirect home.
        res.redirect('/home');
      });

    composer.addAllowedUrl('/logout');
    composer.addAllowedUrl('/auth/github');
    composer.addAllowedUrl('/auth/github/callback(.*)');

    composer.useUserSerializers(
      (user, done) => {
        console.log('SERIALIZE USER!');
        done(null, JSON.stringify(user));
      },
      (user, done) => {
        console.log('DESERIALIZE USER!', user);
        done(null, JSON.parse(user));
      }
    );
  },
};
