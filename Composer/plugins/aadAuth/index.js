// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

const https = require('https');
const { ClientSecretCredential, ManagedIdentityCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');


// eslint-disable-next-line @typescript-eslint/no-var-requires
const { tenantId, clientID, redirectUrl, vaultName, clientSecretSecretName, clientSecret } = require('./config.json');



module.exports = {
  initialize: composer => {
    console.info('Register azure aad auth plugin');
    
    let credential = null;
    if (process.env.NODE_ENV != 'development') {
      credential = new ManagedIdentityCredential();
    } else {
      
      credential = new ClientSecretCredential(tenantId, clientID, clientSecret)
    }

    const url = `https://${vaultName}.vault.azure.net`;

    const kvClient = new SecretClient(url, credential);

    kvClient.getSecret(clientSecretSecretName).then((secret) => {
      SetAADParameters(composer, secret);
    }
    );



    // define this BEFORE turning on the middleware...
    composer.addWebRoute('get', '/login', (req, res) => {
      res.redirect("/auth/aad");
    });

    composer.addWebRoute('get', '/auth/aad', composer.passport.authenticate('azuread-openidconnect'));
    composer.addWebRoute('get', '/logout', (req, res) => {
      req.logout();
      res.redirect('/')
    });

    composer.addWebRoute(
      'post',
      '/auth/aad/callback',
      composer.passport.authenticate('azuread-openidconnect', { failureRedirect: '/login' }),
      function (req, res) {
        console.log('login complete!');
        // Successful authentication, redirect home.
        res.redirect('/home');
      });

    composer.addAllowedUrl('/logout');
    composer.addAllowedUrl('/auth/aad');
    composer.addAllowedUrl('/auth/aad/callback(.*)');

    composer.useUserSerializers(
      (user, done) => {
        // console.log('SERIALIZE USER!');
        done(null, JSON.stringify(user));
      },
      (user, done) => {
        // console.log('DESERIALIZE USER!', user);
        done(null, JSON.parse(user));
      }
    );
  }
}
function SetAADParameters(composer, secret) {
  composer.usePassportStrategy(
    new OIDCStrategy(
      {
        identityMetadata: `https://login.microsoftonline.com/${tenantId}/.well-known/openid-configuration`,
        clientID: clientID,
        redirectUrl: redirectUrl,
        clientSecret: secret.value,
        allowHttpForRedirectUrl: true,
        responseType: "code",
        responseMode: "form_post",
        validateIssuer: true,
      },
      function (iss, sub, profile, access_token, refresh_token, done) {
        if (profile == null) {
          return done(new Error("No oid found"), null);
        }
        return done(null, {
          id: profile.id,
          profile: profile,
          access_token: access_token,
          refresh_token: refresh_token,
          iss: iss,
          sub: sub,
          groups: JSON.parse(profile._json.groups),
        });
      }
    )
  );
}

