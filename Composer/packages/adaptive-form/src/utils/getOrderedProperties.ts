// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UIOptions, JSONSchema7 } from '@bfc/extension';
import cloneDeep from 'lodash/cloneDeep';
import formatMessage from 'format-message';

import { getHiddenProperties } from './getHiddenProperties';

type OrderConfig = (string | [string, string])[];

export function getOrderedProperties(
  schema: JSONSchema7,
  baseUiOptions: UIOptions,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
): OrderConfig {
  const uiOptions = cloneDeep(baseUiOptions);
  const { order = ['*'] } = uiOptions;
  const hiddenFieldSet = getHiddenProperties(uiOptions, data);

  const uiOrder = typeof order === 'function' ? order(data) : order || [];
  const orderedFieldSet = new Set<string>();
  const orderedFields = uiOrder.reduce((allFields, field) => {
    if (field === '*') {
      allFields.push(field);
      orderedFieldSet.add(field);
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

  const allProperties = Object.keys(schema.properties ?? {}).filter(
    (p) => !p.startsWith('$') && !hiddenFieldSet.has(p)
  );

  const restIdx = orderedFields.indexOf('*');
  // only validate wildcard if not all properties are ordered already
  if (allProperties.some((p) => !orderedFieldSet.has(p))) {
    let errorMsg;
    if (restIdx === -1) {
      errorMsg = formatMessage('no wildcard');
    } else if (restIdx !== orderedFields.lastIndexOf('*')) {
      errorMsg = formatMessage('multiple wildcards');
    }

    if (errorMsg) {
      throw new Error(
        formatMessage('Error in UI schema for {title}: {errorMsg}\n{options}', {
          title: schema.title,
          errorMsg,
          options: JSON.stringify(uiOptions, null, 2),
        })
      );
    }
  }

  const restFields = Object.keys(schema.properties || {}).filter((p) => {
    return !orderedFieldSet.has(p) && !p.startsWith('$');
  });

  if (restIdx === -1) {
    orderedFields.push(...restFields);
  } else {
    orderedFields.splice(restIdx, 1, ...restFields);
  }

  return orderedFields;
}
