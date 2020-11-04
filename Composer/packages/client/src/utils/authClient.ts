// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AuthParameters } from '@botframework-composer/types';

async function getAccessToken(options: AuthParameters): Promise<string> {
  try {
    const { clientId = '', targetResource = '', scopes = [] } = options;
    const { __csrf__ = '' } = window;

    let url = '/api/auth/getAccessToken?';
    const params = new URLSearchParams();
    if (clientId) {
      params.append('clientId', clientId);
    }
    if (scopes.length) {
      params.append('scopes', JSON.stringify(scopes));
    }
    if (targetResource) {
      params.append('targetResource', targetResource);
    }
    url += params.toString();

    const result = await fetch(url, { method: 'GET', headers: { 'X-CSRF-Token': __csrf__ } });
    const { accessToken = '' } = await result.json();
    return accessToken;
  } catch (e) {
    // error handling
    console.error('Did not receive an access token back from the server: ', e);
    return '';
  }
}

export const AuthClient = {
  getAccessToken,
};
