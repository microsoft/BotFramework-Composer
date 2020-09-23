// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Fieldset, JSONSchema7, UIOptions } from '@bfc/extension-client';
import formatMessage from 'format-message';
import difference from 'lodash/difference';
import flatten from 'lodash/flatten';
import keys from 'lodash/keys';
import pick from 'lodash/pick';

import { getHiddenProperties } from './getHiddenProperties';

interface FieldSetConfig extends Fieldset {
  schema: JSONSchema7;
  uiOptions: UIOptions;
}

export const getFieldsets = (baseSchema: JSONSchema7, baseUiOptions: UIOptions, value: any): FieldSetConfig[] => {
  const { additionalFields = [], fieldsets: baseFieldsets = [] } = baseUiOptions;
  const { properties } = baseSchema;

  const hiddenProperties = getHiddenProperties(baseUiOptions, value);
  const additionalFieldsNames = additionalFields.map(({ name }) => name);
  const allFields: string[] = [
    ...keys(properties).filter((field) => !(field.startsWith('$') || hiddenProperties.has(field))),
    ...additionalFieldsNames,
  ];

  const fields: string[] = flatten(baseFieldsets.map(({ fields = ['*'] }) => fields));
  const restFields = difference(allFields, fields);

  if (fields.filter((field) => field === '*').length > 1) {
    throw new Error(formatMessage('multiple wildcards'));
  } else if (!fields.includes('*') && allFields.some((field) => !fields.includes(field))) {
    throw new Error(formatMessage('missing fields'));
  } else if (fields.length !== new Set(fields).size) {
    throw new Error(formatMessage('duplicate fields'));
  }

  return baseFieldsets.map(({ fields = ['*'], ...rest }) => {
    const restIdx = fields.indexOf('*');

    if (restIdx > -1) {
      fields.splice(restIdx, 1, ...restFields);
    }

    const uiOptions = {
      ...baseUiOptions,
      additionalFields: additionalFields.filter(({ name }) => fields.includes(name)),
    };
    delete uiOptions.fieldsets;

    const schema = { ...baseSchema, properties: pick(properties, fields) } as JSONSchema7;

    return { ...rest, fields, uiOptions, schema };
  });
};
