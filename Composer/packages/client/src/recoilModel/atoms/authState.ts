// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { AzureTenant, CurrentUser } from '@botframework-composer/types';
import { atom } from 'recoil';

const getFullyQualifiedKey = (value: string) => {
  return `App_${value}_State`;
};

export const showAuthDialogState = atom<boolean>({
  key: getFullyQualifiedKey('showAuthDialog'),
  default: false,
});

export const requiresGraphState = atom<boolean>({
  key: getFullyQualifiedKey('requiresGraph'),
  default: false,
});

export const primaryTokenState = atom<string>({
  key: getFullyQualifiedKey('primaryToken'),
  default: '',
});

export const graphTokenState = atom<string>({
  key: getFullyQualifiedKey('graphToken'),
  default: '',
});

export const availableTenantsState = atom<AzureTenant[]>({
  key: getFullyQualifiedKey('availableTenants'),
  default: [],
});

export const currentTenantState = atom<string>({
  key: getFullyQualifiedKey('currentTenant'),
  default: '',
});

export const showTenantDialogState = atom<boolean>({
  key: getFullyQualifiedKey('showTenantDialog'),
  default: false,
});

export const currentUserState = atom<CurrentUser>({
  key: getFullyQualifiedKey('currentUser'),
  default: {} as CurrentUser,
});

export const isAuthenticatedState = atom<boolean>({
  key: getFullyQualifiedKey('isAuthenticated'),
  default: false,
});

/* I believe this is not used */
export const grahpTokenState = atom<CurrentUser>({
  key: getFullyQualifiedKey('grahpToken'),
  default: {} as CurrentUser,
});
