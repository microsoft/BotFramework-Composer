// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import LgMetaData from '../models/LgMetaData';
import { LgTemplateName } from '../models/stringTypes';

/**
 * { type: 'SendActivity', designerId: '1234' } => 'SendActivity_1234'
 *
 * @param lgMetaData input metadata
 * @returns toString() result of the input object.
 */
export default function buildLgTemplateNameFromLgMetaData(lgMetaData: LgMetaData): LgTemplateName {
  const { type, designerId } = lgMetaData;
  return `${type}_${designerId}`;
}
