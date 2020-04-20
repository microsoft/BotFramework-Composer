// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { nanoid, customAlphabet } from 'nanoid';
import englishLowercase from 'nanoid-dictionary/lowercase';
import numbers from 'nanoid-dictionary/numbers';
import englishUppercase from 'nanoid-dictionary/uppercase';

export const IDDictionnary = [...englishLowercase, ...englishUppercase, ...numbers].join('');
export function generateDesignerId() {
  const nanoid = customAlphabet(IDDictionnary, 6);
  return nanoid();
}

export function generateUniqueId(size = 6) {
  return nanoid(size);
}
