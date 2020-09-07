// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ILanguageFormData {
  languages: string[];
  defaultLang?: string;
  switchTo?: boolean;
}

export interface ILanguage {
  fullName: string;
  abbrName: string;
  locale: string;
}
