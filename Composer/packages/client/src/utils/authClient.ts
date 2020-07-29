// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UserAgentApplication } from 'msal';

export class AuthClient {
  private msal: UserAgentApplication;

  constructor(tenantId: string, clientId: string, redirectUri: string, private scopes: string[]) {
    // TODO: Validate all input parameters
    this.msal = new UserAgentApplication({
      auth: {
        authority: `https://login.microsoftonline.com/${tenantId}/`,
        clientId: clientId,
        redirectUri: redirectUri,
      },
    });
  }

  public async getToken(scopes: string[]): Promise<string | undefined> {
    // TODO: validate input parameter

    // All the supported scopes. This is sent when we do an interactive login
    // in order to obtain consent for all required scopes.
    const scopesRequest = {
      scopes: this.scopes,
    };

    // The specific scopes being requested for the current token.
    // We use these scopes for silent login, so we get a token tailored to the scopes,
    // and maintain least priviledge possible.
    const currentRequest = {
      scopes: scopes,
    };

    // Check if the user is logged in currently.
    if (this.msal.getAccount()) {
      // If the user is already logged in, get the token silently.
      try {
        // User logged in means we can do silent token acquisition with the
        // requested scopes
        const tokenInfo = await this.msal.acquireTokenSilent(currentRequest);
        return tokenInfo.accessToken;
      } catch (e) {
        // If token acquisition fails, we fallback to interactive login.
        await this.msal.loginPopup(scopesRequest);
        const tokenInfo = await this.msal.acquireTokenSilent(currentRequest);
        return tokenInfo.accessToken;
      }
    } else {
      // User not logged in, perform an interactive login
      try {
        // Interactive login should get us an id_token
        await this.msal.loginPopup(scopesRequest);

        // Get the token with the specifically requested scopes
        const tokenInfo = await this.msal.acquireTokenSilent(currentRequest);
        return tokenInfo.accessToken;
      } catch (e) {
        console.error('Error encountered during log in: ', e);
      }
    }
  }
}
