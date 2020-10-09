// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { SDKKinds } from '@bfc/types';

import LgType from '../models/LgType';

/**
 * { hostKind: 'Microsoft.TextInput', hostField: 'prompt' } => 'SendActivity_Prompt'
 *
 * @param lgMetaData input metadata
 * @returns toString() result of the input object.
 */
export default function buildLgType(lgType: LgType): string {
  const { hostKind, hostField } = lgType;
  const kindPrefix = hostKind.replace('Microsoft.', '');
  const fieldSuffix = hostField.charAt(0).toUpperCase() + hostField.slice(1);

  if (hostKind === SDKKinds.SendActivity) {
    return kindPrefix;
  }
  return `${kindPrefix}_${fieldSuffix}`;
}
