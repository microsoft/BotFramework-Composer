// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';

import { UIWidget, UISchema } from './uischema.types';

export class UISchemaProvider {
  schema: UISchema;

  constructor(uiSchema: UISchema) {
    this.schema = uiSchema;
  }

  get = ($type: string): UIWidget => {
    return get(this.schema, $type, this.schema.default);
  };
}
