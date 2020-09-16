// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import uuidv4 from 'uuid/v4';

const state = uuidv4();
const requestId = uuidv4();
const nonce = uuidv4();
const clientId = 'f3723d34-6ff5-4ceb-a148-d99dcd2511fc';
const replyUrl = 'https://dev.botframework.com/cb';
const authorizationEndpoint = 'https://login.microsoftonline.com/common/oauth2/authorize';

export const AUTH_JWKS_URL = 'https://login.microsoftonline.com/common/discovery/keys';

export const DEFAULT_AZURE_LOGIN_CONFIG = [
  `${authorizationEndpoint}?response_type=token`,
  `client_id=${clientId}`,
  `redirect_uri=${replyUrl}`,
  `state=${state}`,
  `client-request-id=${requestId}`,
  `nonce=${nonce}`,
  'response_mode=fragment',
  'resource=https://management.core.windows.net/',
];

export const getLoginUrl = (renew = false) => {
  let bits = DEFAULT_AZURE_LOGIN_CONFIG;
  if (renew) {
    bits = bits.concat(['prompt=none']);
  }
  return bits.join('&');
};
