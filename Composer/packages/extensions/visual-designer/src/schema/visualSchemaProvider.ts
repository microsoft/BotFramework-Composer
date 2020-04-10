// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import { VisualWidget, VisualSchema } from '@bfc/extension';

export class VisualSchemaProvider {
  schema: VisualSchema;

  constructor(...schemas: VisualSchema[]) {
    this.schema = this.mergeSchemas(schemas);
  }

  private mergeSchemas(orderedSchemas: VisualSchema[]): VisualSchema {
    if (!Array.isArray(orderedSchemas) || !orderedSchemas.length) return {};
    return Object.assign({}, ...orderedSchemas);
  }

  get = ($kind: string): VisualWidget => {
    return get(this.schema, $kind, this.schema.default);
  };
}
