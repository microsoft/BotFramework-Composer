// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ToolbarLuEntityType } from './types';

export const jsLuToolbarMenuClassName = 'js-lu-toolbar-menu';

export const getDefaultMlEntityName = (entityType: ToolbarLuEntityType) => `${entityType}EntityName`;

export const prebuiltEntities = [
  'age',
  'datetimeV2',
  'dimension',
  'email',
  'geographyV2',
  'money',
  'number',
  'ordinal',
  'percentage',
  'personName',
  'phonenumber',
  'temperature',
  'url',
  'datetime',
];
