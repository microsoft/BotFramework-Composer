// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ISkillFormData {
  manifestUrl: string;
  name?: string;
}

export interface ISkillFormDataErrors {
  manifestUrl?: string;
  manifestUrlFetch?: string;
  name?: string;
}

export const skillUrlRegex = /^http[s]?:\/\/\w+/;
export const skillNameRegex = /^\w[-\w]*$/;
