// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import moment from 'moment';

import { FileTypes, SupportedFileTypes } from '../constants';
import { File } from '../store/types';

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
  if (bytes === 0 || !bytes) return '0 Bytes';
  const k = 1024,
    dm = !decimals || decimals <= 0 ? 0 : decimals || 2,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const calculateTimeDiff = (time: any) => {
  return moment(time).fromNow();
};
