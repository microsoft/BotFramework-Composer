// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ISkillFormData {
  manifestUrl: string;
  name?: string;
}

export interface ISkillFormDataErrors {
  manifestUrl?: string;
  name?: string;
}

export const SkillUrlRegex = /^http[s]?:\/\/\w+/;
