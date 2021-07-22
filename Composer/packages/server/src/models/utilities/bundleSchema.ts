// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import $RefParser from '@apidevtools/json-schema-ref-parser';

import logger from '../../logger';

const log = logger.extend('schema');

export async function bundleSchema(schemaPath: string) {
  try {
    const parser = new $RefParser();
    const bundled = await parser.bundle(schemaPath);
    return bundled;
  } catch (err) {
    log('Error while bundling schema at %s', schemaPath);
    log('%O', err);
  }
}
