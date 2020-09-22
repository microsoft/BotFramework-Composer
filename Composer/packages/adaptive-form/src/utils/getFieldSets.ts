// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7, UIOptions } from '@bfc/extension-client';
import formatMessage from 'format-message';
import difference from 'lodash/difference';
import flatten from 'lodash/flatten';
import keys from 'lodash/keys';
import pick from 'lodash/pick';

import { getHiddenProperties } from './getHiddenProperties';

export const getFieldSets = (schema: JSONSchema7, uiOptions: UIOptions, value: any) => {
  const { fieldSets: baseFieldSets = [] } = uiOptions;
  const { properties } = schema;

  const hiddenProperties = getHiddenProperties(uiOptions, value);
  const allFields: string[] = keys(properties).filter(
    (field) => !(field.startsWith('$') || hiddenProperties.has(field))
  );
  const fields: string[] = flatten(baseFieldSets.map(({ fields = ['*'] }) => fields));
  const restFields = difference(allFields, fields);

  if (fields.filter((field) => field === '*').length > 1) {
    throw new Error(formatMessage('multiple wildcards'));
  } else if (!fields.includes('*') && allFields.some((field) => !fields.includes(field))) {
    throw new Error(formatMessage('missing fields'));
  } else if (fields.length !== new Set(fields).size) {
    throw new Error(formatMessage('duplicate fields'));
  }

  return baseFieldSets.map(({ fields = ['*'], ...rest }) => {
    const restIdx = fields.indexOf('*');

    if (restIdx > -1) {
      fields.splice(restIdx, 1, ...restFields);
    }

    return { ...rest, fields, schema: { ...schema, properties: pick(schema.properties, fields) } as JSONSchema7 };
  });
};
