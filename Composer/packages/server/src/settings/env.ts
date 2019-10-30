// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const absHosted = !!process.env.PUBLIC_URL;
export const absHostRoot = process.env.WEBSITE_HOSTNAME
  ? `https://${process.env.WEBSITE_HOSTNAME}`
  : 'http://localhost:3978';
