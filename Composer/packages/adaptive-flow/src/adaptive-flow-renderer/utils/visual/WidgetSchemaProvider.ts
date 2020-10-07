// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import merge from 'lodash/merge';
import { FlowWidget, FlowUISchema } from '@bfc/extension-client';

export class WidgetSchemaProvider {
  schema: FlowUISchema;

  /**
   * @param schemas Schemas to be merged together. Latter ones will override former ones.
   */
  constructor(...schemas: FlowUISchema[]) {
    this.schema = this.mergeSchemas(schemas);
  }

  private mergeSchemas(orderedSchemas: FlowUISchema[]): FlowUISchema {
    if (!Array.isArray(orderedSchemas) || !orderedSchemas.length) return {};
    return merge({}, ...orderedSchemas);
  }

  get = ($kind: string): FlowWidget => {
    return get(this.schema, $kind, this.schema.default);
  };
}
