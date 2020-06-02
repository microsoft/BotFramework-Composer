// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import { FlowWidget, FlowSchema } from '@bfc/extension';

export class WidgetSchemaProvider {
  schema: FlowSchema;

  /**
   * @param schemas Schemas to be merged together. Latter ones will override former ones.
   */
  constructor(...schemas: FlowSchema[]) {
    this.schema = this.mergeSchemas(schemas);
  }

  private mergeSchemas(orderedSchemas: FlowSchema[]): FlowSchema {
    if (!Array.isArray(orderedSchemas) || !orderedSchemas.length) return {};
    return Object.assign({}, ...orderedSchemas);
  }

  get = ($kind: string): FlowWidget => {
    return get(this.schema, $kind, this.schema.default);
  };
}
