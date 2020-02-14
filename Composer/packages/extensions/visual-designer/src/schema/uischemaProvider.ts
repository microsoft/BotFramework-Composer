// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';

import { uiSchema } from './uischema';
import { UIWidgetSchema } from './uischema.types';

export class UISchemaProvider {
  static provideWidgetSchema = ($type: string): UIWidgetSchema => {
    return get(uiSchema, $type, uiSchema.default);
  };
}
