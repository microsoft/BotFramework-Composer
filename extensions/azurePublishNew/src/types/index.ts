// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type ProvisionAction = 'create' | 'import' | 'generate';

export type ResourcesItem = {
  description: string;
  text: string;
  tier: string;
  group: string;
  key: string;
  required: boolean;
  [key: string]: any;
};
