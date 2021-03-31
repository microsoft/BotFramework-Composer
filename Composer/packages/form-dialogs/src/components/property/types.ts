/* eslint-disable @typescript-eslint/no-explicit-any */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type PropertyCardData = {
  id: string;
  name: string;
  isArray: boolean;
  isRequired: boolean;
  propertyType: string;
} & Record<string, any>;
