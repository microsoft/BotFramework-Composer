// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UIOptions, JSONSchema7 } from '@bfc/extension';
import cloneDeep from 'lodash/cloneDeep';

const globalHiddenProperties = ['$type', '$id', '$copy', '$designer', 'id'];

type OrderConfig = (string | [string, string])[];

export function getOrderedProperties(
  schema: JSONSchema7,
  uiOptions: UIOptions,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
): OrderConfig {
  const { hidden: hidden, order: order = ['*'] } = cloneDeep(uiOptions);

  const hiddenFieldSet = new Set(typeof hidden === 'function' ? hidden(data) : hidden || []);
  globalHiddenProperties.forEach(f => hiddenFieldSet.add(f));

  const uiOrder = typeof order === 'function' ? order(data) : order || [];
  const orderedFieldSet = new Set<string>();
  const orderedFields = uiOrder.reduce((allFields, field) => {
    if (field === '*') {
      allFields.push(field);
      return allFields;
    }

    if (Array.isArray(field)) {
      const fieldTuple: string[] = [];
      for (const f of field) {
        if (!hiddenFieldSet.has(f) && schema.properties?.[f]) {
          orderedFieldSet.add(f);
          fieldTuple.push(f);
        }
      }

      if (fieldTuple.length === 2) {
        allFields.push(fieldTuple as [string, string]);
      } else {
        allFields.push(...fieldTuple);
      }
    } else {
      if (!hiddenFieldSet.has(field) && schema.properties?.[field]) {
        orderedFieldSet.add(field);
        allFields.push(field);
      }
    }

    return allFields;
  }, [] as OrderConfig);

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

  const restFields = Object.keys(schema.properties || {}).filter(p => {
    return !orderedFieldSet.has(p) && !hiddenFieldSet.has(p) && !p.startsWith('$');
  });

  orderedFields.splice(restIdx, 1, ...restFields);
  return orderedFields;
}
