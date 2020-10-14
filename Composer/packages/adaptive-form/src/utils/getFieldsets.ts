// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Fieldset, JSONSchema7, UIOptions } from '@bfc/extension-client';
import formatMessage from 'format-message';
import difference from 'lodash/difference';
import flatMap from 'lodash/flatMap';
import flatten from 'lodash/flatten';
import pick from 'lodash/pick';
import pickBy from 'lodash/pickBy';

import { getSchemaWithAdditionalFields } from './getSchemaWithAdditionalFields';
import { getOrderedProperties } from './getOrderedProperties';

interface FieldSetConfig extends Fieldset {
  schema: JSONSchema7;
  uiOptions: UIOptions;
}

const isFieldsetArray = (fields: string[] | Fieldset<string[]>[]): fields is Fieldset<string[]>[] => {
  return fields.every((field) => typeof field === 'object');
};

export const getFieldsets = (baseSchema: JSONSchema7, baseUiOptions: UIOptions, value: any): FieldSetConfig[] => {
  const { fieldsets: baseFieldsets = [] } = baseUiOptions;
  const { properties } = baseSchema;

  const schema = getSchemaWithAdditionalFields(baseSchema, baseUiOptions);
  const orderedFields = flatten(getOrderedProperties(schema, baseUiOptions, value));

  if (
    !baseFieldsets.every(
      ({ fields = ['*'] }) =>
        fields.every((field) => typeof field === 'string') || fields.every((field) => typeof field === 'object')
    )
  ) {
    throw new Error(formatMessage('fields must be either all strings or all fieldset objects'));
  }

  const fields: string[] = flatMap(baseFieldsets, ({ fields = ['*'] }) => {
    if (isFieldsetArray(fields)) {
      return flatMap(fields, ({ fields: nestedFields = ['*'] }) => nestedFields);
    }
    return fields;
  });
  const restFields = difference(orderedFields, fields);

  if (fields.filter((field) => field === '*').length > 1) {
    throw new Error(formatMessage('multiple wildcards'));
  } else if (!fields.includes('*') && orderedFields.some((field) => !fields.includes(field))) {
    throw new Error(formatMessage('missing fields'));
  } else if (fields.length !== new Set(fields).size) {
    throw new Error(formatMessage('duplicate fields'));
  }

  return baseFieldsets.map(({ fields = ['*'], ...rest }) => {
    const fieldsetArray = isFieldsetArray(fields);
    const allFields = fieldsetArray
      ? flatMap(fields as Fieldset<string[]>[], ({ fields = ['*'] }) => fields)
      : (fields as string[]);
    const restIdx = allFields.indexOf('*');

    if (restIdx > -1) {
      allFields.splice(restIdx, 1, ...restFields);
    }

    const uiOptions = pickBy({
      ...baseUiOptions,
      order: allFields,
      properties: pick(baseUiOptions.properties, allFields),
    });

    if (fieldsetArray) {
      uiOptions.fieldsets = fields;
      delete uiOptions.pivotFieldsets;
    } else {
      delete uiOptions.fieldsets;
    }

    const schema = { ...baseSchema, properties: pick(properties, allFields) } as JSONSchema7;

    return { ...rest, fields, uiOptions, schema };
  });
};
