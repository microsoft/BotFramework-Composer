// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import LuType from '../models/LuType';
import { LuIntentName } from '../models/stringTypes';

/**
 * example: 'TextInput_Response_RuZhXe' <= { type: 'TextInput_Response', designerId: 'RuZhXe' } // LuMetaData
 *
 * @param LuMetaData input metadata
 * @returns toString() result of the input object.
 */
export default function buildLuType(luType: LuType): LuIntentName {
  const { hostKind, type } = luType;
  const kindPrefix = hostKind.replace('Microsoft.', '').replace('.', '');
  const typeSuffix = type.charAt(0).toUpperCase() + type.slice(1);
  return `${kindPrefix}_${typeSuffix}`;
}
