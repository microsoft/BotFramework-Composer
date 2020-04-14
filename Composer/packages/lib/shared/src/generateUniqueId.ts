// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { customAlphabet } from 'nanoid';
import englishLowercase from 'nanoid-dictionary/lowercase';
import numbers from 'nanoid-dictionary/numbers';
import englishUppercase from 'nanoid-dictionary/uppercase';

export const IDDictionnary = [...englishLowercase, ...englishUppercase, ...numbers].join('');
export function generateUniqueId(size = 6) {
  const nanoid = customAlphabet(IDDictionnary, size);
  return nanoid();
}
