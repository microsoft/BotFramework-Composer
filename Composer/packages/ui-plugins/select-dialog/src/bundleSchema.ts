// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import $RefParser from '@apidevtools/json-schema-ref-parser';
import { JSONSchema7 } from '@bfc/extension-client';
import cloneDeep from 'lodash/cloneDeep';

/**
 * Bundles all remote $refs into a single JSON Schema object.
 * @param schema The json schema to bundle
 */
export async function bundleSchema(schema: JSONSchema7) {
  try {
    const parser = new $RefParser();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bundled = await parser.bundle(cloneDeep(schema) as any);
    return bundled as JSONSchema7;
  } catch (err) {
    return schema;
  }
}
