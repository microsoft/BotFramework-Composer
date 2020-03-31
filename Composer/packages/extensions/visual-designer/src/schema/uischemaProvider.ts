// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';

import { UIWidget, UISchema, WidgetGeneratorV1 } from './uischema.types';
import { genWidgetSchema } from './uischema';

export class UISchemaProvider {
  schema: UISchema;

  constructor(uiSchema: UISchema, customizationSet: { [$type: string]: WidgetGeneratorV1 } = {}) {
    const schemaPatch = Object.keys(customizationSet).reduce((result, $type) => {
      result[$type] = genWidgetSchema(customizationSet[$type]);
      return result;
    }, {});
    this.schema = { ...uiSchema, ...schemaPatch };
  }

  get = ($type: string): UIWidget => {
    return get(this.schema, $type, this.schema.default);
  };
}
