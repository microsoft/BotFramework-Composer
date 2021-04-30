// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type NextStep = {
  checked: boolean;
  key: string;
  description: string;
  learnMore?: string;
  required?: boolean;
  label: string;
  onClick: (step?: NextStep) => void;
  highlight?: (step?: NextStep) => void;
  hideFeatureStep: boolean;
};
