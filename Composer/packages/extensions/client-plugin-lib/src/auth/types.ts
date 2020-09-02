// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface OAuthOptions {
  /** Client ID of the AAD app that the user is authenticating against. */
  clientId: string;
  /** List of OAuth scopes that will be granted once the user has authenticated. */
  scopes: string[];
}
