// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import moment from 'moment';
import formatMessage from 'format-message';
import generate from 'format-message-generate-id';

import { FileTypes, SupportedFileTypes } from '../constants';
import { File } from '../recoilModel/types';

import httpClient from './httpUtil';

export function getExtension(filename?: string): string | any {
  if (typeof filename !== 'string') return filename;
  return filename.substring(filename.lastIndexOf('.') + 1, filename.length) || filename;
}

export function getBaseName(filename?: string): string | any {
  if (typeof filename !== 'string') return filename;
  return filename.substring(0, filename.lastIndexOf('.')) || filename;
}

export function upperCaseName(filename?: string): string | any {
  if (typeof filename !== 'string') return filename;
  return filename.charAt(0).toUpperCase() + filename.slice(1);
}

export function resolveToBasePath(base: string, relPath: string) {
  const leaf = relPath.startsWith('/') ? relPath : `/${relPath}`;
  return base === '/' ? leaf : `${base}${leaf}`;
}

export function getFileName(path: string): string {
  return path.split('/').pop() || path;
}

// todo: icon file is fixed for now, need to be updated when get it from
// designer.
export function getFileIconName(file: File) {
  const path = file.path;
  let docType = file.type;
  if (docType === FileTypes.FOLDER) {
    return docType;
  } else if (docType === FileTypes.BOT) {
    return docType;
  } else {
    docType = path.substring(path.lastIndexOf('.') + 1, path.length);
    if (SupportedFileTypes.includes(docType)) {
      return docType;
    }

    return FileTypes.UNKNOWN;
  }
}

export function getFileEditDate(file: File) {
  if (file && file.lastModified) {
    return new Date(file.lastModified).toLocaleDateString();
  }

  return '';
}

export function formatBytes(bytes?: number, decimals?: number) {
  if (bytes === 0 || !bytes) return formatMessage('0 Bytes');
  const k = 1024,
    dm = !decimals || decimals <= 0 ? 0 : decimals || 2,
    sizes = [
      formatMessage('Bytes'),
      formatMessage('KB'),
      formatMessage('MB'),
      formatMessage('GB'),
      formatMessage('TB'),
    ],
    i = Math.floor(Math.log(bytes) / Math.log(k));

  // TODO: use Intl.NumberFormat once we can get the locale

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const calculateTimeDiff = (time: any) => {
  return moment(time).fromNow();
};

export async function loadLocale(locale: string) {
  // we're changing the locale, which might fail if we can't load it
  const resp = await httpClient.get(`/assets/locales/${locale}.json`);
  const data = resp?.data;
  if (data == null || typeof data === 'string') {
    // this is an invalid locale, so don't set anything
    console.error('Tried to read an invalid locale');
    return null;
  } else {
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

export const getUniqueName = (list: string[], currentName: string, seperator = '-') => {
  let uniqueName = currentName;
  let i = 1;
  while (list.includes(uniqueName)) {
    uniqueName = `${currentName}${seperator}${i}`;
    i++;
  }
  return uniqueName;
};

export const getFileNameFromPath = (param: string, ext: string | undefined = undefined) => {
  return path.basename(param, ext).replace(/\\/g, '/');
};

export const getAbsolutePath = (basePath: string, relativePath: string) => {
  return path.resolve(basePath, relativePath);
};
