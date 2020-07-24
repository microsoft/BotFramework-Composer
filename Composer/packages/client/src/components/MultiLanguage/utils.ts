// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import without from 'lodash/without';

import { Locales } from '../../locales';

export const languageListTemplatesSorted = (languages: string[], locale: string, defaultLanguage: string) => {
  const defaultLanguageTemplate =
    Locales.find((lang) => lang.locale === defaultLanguage) || Locales.find((lang) => lang.locale === 'en-us');
  if (!defaultLanguageTemplate) {
    throw new Error(`Invalid default language ${defaultLanguage}`);
  }
  const restLanguages = without(Locales, defaultLanguageTemplate);
  const resortedLanguages = [defaultLanguageTemplate, ...restLanguages];
  const languageList = resortedLanguages.map((lang) => {
    const isEnabled = languages.includes(lang.locale);
    const isCurrent = locale === lang.locale;
    const isDefault = defaultLanguage === lang.locale;
    return {
      ...lang,
      isEnabled,
      isDefault,
      isCurrent,
    };
  });
  return languageList;
};

export const languageListTemplates = (languages: string[], locale: string, defaultLanguage: string) => {
  const languageList = Locales.map((lang) => {
    const isEnabled = languages.includes(lang.locale);
    const isCurrent = locale === lang.locale;
    const isDefault = defaultLanguage === lang.locale;
    return {
      ...lang,
      isEnabled,
      isDefault,
      isCurrent,
    };
  });
  return languageList;
};
