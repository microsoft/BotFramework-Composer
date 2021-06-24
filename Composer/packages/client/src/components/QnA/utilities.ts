// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import cloneDeep from 'lodash/cloneDeep';

export const QnALanguageToLocale = (language: string): string => {
  switch (language) {
    case 'Chinese_Simplified':
      return 'zh-cn';
    case 'English':
      return 'en-us';
    case 'French':
      return 'fr-fr';
  }
  return language;
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
