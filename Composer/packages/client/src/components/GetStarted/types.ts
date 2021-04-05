// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type NextSteps = {
  checked: boolean;
  key: string;
  description: string;
  learnMore?: string;
  required?: boolean;
  label: string;
  onClick: (step?: NextSteps) => void;
  highlight?: (step?: NextSteps) => void;
};
