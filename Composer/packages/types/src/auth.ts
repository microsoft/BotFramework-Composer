// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type AuthParameters = {
  /** What login endpoint to use
   *
   * ex: https://login.microsoftonline.com/common
   */
  authority?: string;

  /** (Web) Client ID of the AAD app that the user is authenticating against. */
  clientId?: string;
  /** (Web) List of OAuth scopes that will be granted once the user has authenticated. */
  scopes?: string[];

  /**
   * (Desktop) The resource for which we want to get a token for.
   *
   * ex: https://microsoft.graph.com/ or 1a3e55f-a8503cf-32bfde0
   */
  targetResource?: string;
};

export type ElectronAuthParameters = {
  /** What login endpoint to use
   *
   * ex: https://login.microsoftonline.com/common
   */
  authority?: string;

  /**
   * The resource for which we want to get a token for.
   *
   * ex: https://microsoft.graph.com/ or 1a3e55f-a8503cf-32bfde0
   */
  targetResource: string;
};

export type WebAuthParameters = {
  /** Client ID of the AAD app that the user is authenticating against. */
  clientId: string;
  /** List of OAuth scopes that will be granted once the user has authenticated. */
  scopes?: string[];
};

export type CurrentUser = {
  token: string; // aad token
  graph: string | null; // graph token
  email?: string;
  name?: string;
  expiration?: number;
  sessionExpired: boolean;
};
