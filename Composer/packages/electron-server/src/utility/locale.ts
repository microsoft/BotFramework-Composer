// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from 'path';

import formatMessage from 'format-message';
import generate from 'format-message-generate-id';
import { UserSettings } from '@bfc/shared';
import { app } from 'electron';

import { ensureDirectory, ensureJsonFileSync, readTextFileSync, writeJsonFileSync } from './fs';
import log from './logger';

const defaultAppLocale = { appLocale: 'en-US' };
export const appLocaleFilePath = path.join(app.getPath('userData'), 'appLocale.json');

/**
 * Returns the persisted app locale or en-US as default.
 */
export const getAppLocale = (): Pick<UserSettings, 'appLocale'> => {
  ensureJsonFileSync(appLocaleFilePath, defaultAppLocale);
  const raw = readTextFileSync(appLocaleFilePath);
  return JSON.parse(raw) as UserSettings;
};

/**
 * Updates persisted app locale.
 * @param appLocale New app locale.
 */
export const updateAppLocale = async (appLocale: string) => {
  const directory = path.parse(appLocaleFilePath).dir;
  await ensureDirectory(directory);
  await writeJsonFileSync(appLocaleFilePath, { appLocale });
};

/**
 * Initializes the format-message library with the translations for the given locale.
 * @param locale New locale to be used.
 */
export const loadLocale = (locale: string) => {
  if (locale) {
    // we're changing the locale, which might fail if we can't load it
    const raw = readTextFileSync(path.join(__dirname, `../../locales/${locale}.json`));
    const data = raw ? JSON.parse(raw) : raw;
    if (typeof data === 'object' && data !== null) {
      // We don't care about the return value except in our unit tests
      return formatMessage.setup({
        locale: locale,
        generateId: generate.underscored_crc32,
        missingTranslation: process.env.NODE_ENV === 'development' ? 'warning' : 'ignore',
        translations: {
          [locale]: data,
        },
      });
    }
  }

  // this is an invalid locale, so don't set anything
  log('Tried to read an invalid locale');
  return null;
};
