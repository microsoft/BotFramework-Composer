// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type OAuthOptions = {
  /** (Web) Client ID of the AAD app that the user is authenticating against. */
  clientId?: string;
  /** (Web) List of OAuth scopes that will be granted once the user has authenticated. */
  scopes?: string[];

  /** (Desktop) The resource for which we want to get a token for. (ex. https://microsoft.graph.com/) */
  targetResource?: string;
};

async function getAccessToken(options: OAuthOptions): Promise<string> {
  try {
    const { clientId = '', targetResource = '', scopes = [] } = options;
    const { __csrf__ = '' } = window;

    let url = '/auth/getAccessToken?';
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

export const OAuthClient = {
  getAccessToken,
};
