// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import merge from 'lodash/merge';

import { FlowWidget, FlowSchema } from '../../types/flowRenderer.types';

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
    return merge({}, ...orderedSchemas);
  }

  get = ($kind: string): FlowWidget => {
    return get(this.schema, $kind, this.schema.default);
  };
}
