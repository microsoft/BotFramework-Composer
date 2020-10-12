// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type OAuthOptions = {
  clientId: string;
  scopes: string[];
};

async function getAccessToken(options: OAuthOptions): Promise<string> {
  try {
    const { clientId, scopes } = options;
    const url = `/auth/getAccessToken?clientId=${encodeURIComponent(clientId)}&scopes=${encodeURIComponent(
      JSON.stringify(scopes)
    )}`;
    const result = await fetch(url, { method: 'GET' });
    const { accessToken = '' } = await result.json();
    return accessToken;
  } catch (e) {
    // error handling
    return '';
  }
}

export const OAuthClient = {
  getAccessToken,
};
