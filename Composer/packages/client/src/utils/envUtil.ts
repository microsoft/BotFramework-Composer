// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const isAbsHosted = () => process.env.COMPOSER_AUTH_PROVIDER === 'abs-h' || process.env.MOCKHOSTED;
export enum BotEnvironments {
  PRODUCTION = 'production',
  INTEGRATION = 'integration',
}
