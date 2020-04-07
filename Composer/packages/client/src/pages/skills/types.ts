// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ISkillFormData {
  manifestUrl: string;
}

export interface ISkillFormDataErrors {
  manifestUrl?: string;
}

export const SkillUrlRegex = /^http[s]?:\/\/\w+/;
