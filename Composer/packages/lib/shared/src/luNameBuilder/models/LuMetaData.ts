// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import buildLuIntentName from '../stringBuilders/buildLuIntentName';

import { LuIntentName } from './stringTypes';

/**
 * LuMetaData can be converted from & to Lu intent name. Such as 'TextInput_Response_RuZhXe'.
 * It's created by Composer, contains designerId and filed type.
 */
export default class LuMetaData {
  type: string;
  designerId: string;

  constructor(luType: string, designerId: string) {
    this.type = luType;
    this.designerId = designerId;
  }

  toString(): LuIntentName {
    return buildLuIntentName(this);
  }
}
