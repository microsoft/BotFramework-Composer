// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// dev: allow force enable OneAuth, use shim by default
// prod: allow to force enable the shim, use OneAuth by default
// fallback to the shim if OS is not supported in any case
export const isOneAuthEnabled =
  ['darwin', 'win32'].includes(process.platform) &&
  ((process.env.COMPOSER_ENABLE_ONEAUTH !== 'false' && process.env.NODE_ENV !== 'development') ||
    (process.env.COMPOSER_ENABLE_ONEAUTH === 'true' && process.env.NODE_ENV === 'development'));
