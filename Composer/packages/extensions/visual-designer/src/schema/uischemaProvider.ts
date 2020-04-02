// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';

import { UIWidget, UISchema } from './uischema.types';

export class UISchemaProvider {
  schema: UISchema;

  constructor(uiSchema: UISchema) {
    this.schema = uiSchema;
  }

  get = ($kind: string): UIWidget => {
    return get(this.schema, $kind, this.schema.default);
  };
}
