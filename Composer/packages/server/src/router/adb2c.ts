// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import passport from 'passport';

import { AuthProviderInit } from './types';

const adb2c: AuthProviderInit = {
  initialize: () => {
    return {
      login: null,
      authorize: passport.authenticate('oauth-bearer'),
    };
  },
};

export default adb2c;
