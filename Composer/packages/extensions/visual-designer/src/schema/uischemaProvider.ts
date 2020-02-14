// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';

import { uiSchema } from './uischema';
import { UIWidget } from './uischema.types';

export class UISchemaProvider {
  static provideWidgetSchema = ($type: string): UIWidget => {
    return get(uiSchema, $type, uiSchema.default);
  };
}
