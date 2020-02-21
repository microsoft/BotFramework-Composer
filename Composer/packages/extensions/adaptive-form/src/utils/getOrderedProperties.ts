// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema4 } from 'json-schema';
import { UIOptions } from '@bfc/extension';
import cloneDeep from 'lodash/cloneDeep';

export function getOrderedProperties(
  schema: JSONSchema4,
  uiOptions: UIOptions,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
): string[] {
  const { hidden: hidden, order: order = ['*'] } = cloneDeep(uiOptions);

  const hiddenFieldSet = new Set(typeof hidden === 'function' ? hidden(data) : hidden || []);

  const filterFields = (field: string) => {
    return field === '*' || (!hiddenFieldSet.has(field) && schema.properties?.[field]);
  };

  const orderedFields: string[] = (typeof order === 'function' ? order(data) : order || []).filter(filterFields);
  const orderedFieldSet = new Set(orderedFields);

  const restIdx = orderedFields.indexOf('*');

  let errorMsg = '';
  if (restIdx === -1) {
    errorMsg = 'no wildcard';
  } else if (restIdx !== orderedFields.lastIndexOf('*')) {
    errorMsg = 'multiple wildcards';
  }

  if (errorMsg) {
    throw new Error(`Error in ui schema for ${schema.title}: ${errorMsg}\n${JSON.stringify(uiOptions, null, 2)}`);
  }

  const restFields = Object.keys(schema.properties || {}).filter(
    p => !orderedFieldSet.has(p) && !hiddenFieldSet.has(p) && !p.startsWith('$')
  );

  orderedFields.splice(restIdx, 1, ...restFields);
  return orderedFields;
}
