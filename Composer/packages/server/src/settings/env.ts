// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const absHosted = process.env.COMPOSER_AUTH_PROVIDER === 'abs-h';
export const absHostRoot = process.env.WEBSITE_HOSTNAME
  ? `https://${process.env.WEBSITE_HOSTNAME}`
  : 'http://localhost:3978';
