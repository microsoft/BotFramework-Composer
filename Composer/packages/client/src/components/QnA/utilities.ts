// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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
