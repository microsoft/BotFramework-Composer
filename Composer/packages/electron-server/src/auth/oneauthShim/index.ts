// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { OneAuth } from '../oneauth';

export const oneauthShim = ({
  initialize() {},
  shutdown() {},
  setLogPiiEnabled() {},
  setLogCallback() {},
  signInInteractively() {},
  signInSilently() {},
  AppConfiguration() {},
  AadConfiguration() {},
  AuthParameters() {},
  AuthResult() {},
  Account() {},
} as unknown) as typeof OneAuth;
export default oneauthShim;
