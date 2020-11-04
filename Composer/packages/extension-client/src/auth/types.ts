// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface OAuthOptions {
  /** (Web) Client ID of the AAD app that the user is authenticating against. */
  clientId?: string;
  /** (Web) List of OAuth scopes that will be granted once the user has authenticated. */
  scopes?: string[];

  /** (Desktop) The resource for which we want to get a token for. (ex. https://microsoft.graph.com/) */
  targetResource?: string;
}
