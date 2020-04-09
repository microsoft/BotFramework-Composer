// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import { VisualWidget, VisualSchema } from '@bfc/extension';

export class VisualSchemaProvider {
  schema: VisualSchema;

  constructor(visualSchema: VisualSchema) {
    this.schema = visualSchema;
  }

  get = ($kind: string): VisualWidget => {
    return get(this.schema, $kind, this.schema.default);
  };
}
