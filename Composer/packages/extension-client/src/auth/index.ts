// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AuthParameters, AzureTenant } from '@botframework-composer/types';

import { ComposerGlobalName } from '../common/constants';

/**
 * log out current user
 */
export function logOut(): Promise<void> {
  return window[ComposerGlobalName].logOut();
}

/** Requests an access token from Azure for a given client ID with the provided scopes.
 *  Returns an access token that can be used to call APIs on behalf of the user.
 *
 */
export function getAccessToken(params: AuthParameters): Promise<string> {
  return window[ComposerGlobalName].getAccessToken(params);
}

/**
 * Logs the user in and returns a list of available Azure tenants.
 */
export function getTenants(): Promise<AzureTenant[]> {
  return window[ComposerGlobalName].getTenants();
}

/**
 * Returns an ARM token for the specified tenant. Should be called AFTER getTenants().
 * @param tenantId Tenant to retrieve an ARM token for
 */
export function getARMTokenForTenant(tenantId: string): Promise<string> {
  return window[ComposerGlobalName].getARMTokenForTenant(tenantId);
}
