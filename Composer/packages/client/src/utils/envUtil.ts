// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const isAbsHosted = () => process.env.COMPOSER_AUTH_PROVIDER === 'abs-h' || process.env.MOCKHOSTED != null;
export enum BotEnvironments {
  PRODUCTION = 'production',
  INTEGRATION = 'integration',
}
