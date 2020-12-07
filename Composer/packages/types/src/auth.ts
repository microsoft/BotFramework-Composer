// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type AuthParameters = {
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
