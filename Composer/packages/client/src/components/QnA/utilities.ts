// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import cloneDeep from 'lodash/cloneDeep';
import invertBy from 'lodash/invertBy';
import localeToQnALanguageMap from '@microsoft/bf-lu/lib/parser/utils/enums/localeToQnALanguageMap.js';

const languageToLocales = invertBy(localeToQnALanguageMap);

export const isLocalesOnSameLanguage = (locale: string, language: string): boolean => {
  const langLocales = languageToLocales[language];
  return langLocales?.includes(locale) ?? false;
};

export const initializeLocales = (locales: string[], defaultLocale: string) => {
  const newLocales = cloneDeep(locales);
  const index = newLocales.findIndex((l) => l === defaultLocale);
  if (index < 0) throw new Error(`default language ${defaultLocale} does not exist in languages`);
  newLocales.splice(index, 1);
  newLocales.sort();
  newLocales.unshift(defaultLocale);
  return newLocales;
};
