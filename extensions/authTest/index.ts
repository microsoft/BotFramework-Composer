// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BearerStrategy } from 'passport-azure-ad';

import { ExtensionRegistration } from '../../Composer/packages/extension/src/extensionRegistration';

module.exports = {
  initialize: (composer: ExtensionRegistration) => {
    console.log('Register adb2c auth plugin');
    const tenantName = 'beebotaiqatb2c';
    const clientId = 'be67666f-387f-400c-b320-3f0bbcf0b5a8';
    const policyName = 'B2C_1_SignIn';
    const tenantIdGuid = '6d005c65-5a1f-40c8-a0f8-8785a7ed43ee';
    const b2cTenantName = 'beebotaiqatb2c.onmicrosoft.com';
    const b2cTenantInstance = 'beebotaiqatb2c.b2clogin.com';

    // const tenantName = 'beebotaiuatb2c';
    // const clientId = '4ff50f6a-23bc-412b-a54f-4c96deac5fa3';
    // const policyName = 'B2C_1_SignIn';
    // const tenantIdGuid = '349fc997-2466-45ff-9867-a9f94a76268c';
    // const b2cTenantName = 'beebotaiuatb2c.onmicrosoft.com';
    // const b2cTenantInstance = 'beebotaiuatb2c.b2clogin.com';

    const options = {
      identityMetadata: `https://${b2cTenantInstance}/${b2cTenantName}/${policyName}/v2.0/.well-known/openid-configuration/`,
      clientID: clientId,
      audience: clientId,
      policyName: policyName,
      isB2C: true,
      validateIssuer: true,
      loggingLevel: 'error',
      passReqToCallback: false,
    };

    //<ms_docref_init_azuread_lib>
    const bearerStrategy = new BearerStrategy(options, (token, done) => {
      done(
        null,
        {
          customer: token.extension_CustomerId,
          isAdmin: token.extension_IsAdmin,
          isCreator: token.extension_IsCreator,
          name: 'EXAMPLE NAME',
        },
        token
      );
    });

    composer.usePassportStrategy(bearerStrategy);

    composer.useAuthMiddleware((req, res, next) => {
      console.log('accessing url ' + req.url);
      if (req.isAuthenticated()) {
        console.log('AUTHENTICATED');
        next?.();
        return;
      } else {
        console.log('UNAUTHENTICATED');
        if (next) {
          next?.();
          return;
        }
      }
    });
  },
};
