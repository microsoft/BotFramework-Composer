// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7, UIOptions } from '@bfc/extension-client';
import difference from 'lodash/difference';
import fromPairs from 'lodash/fromPairs';
import keys from 'lodash/keys';

const getSchemaWithAdditionalFields = (baseSchema: JSONSchema7, uiOptions: UIOptions): JSONSchema7 => {
  const additionalFields = difference(keys(uiOptions.properties), keys(baseSchema.properties));
  const additionalPropertySchema = fromPairs(additionalFields.map((field) => [field, { $role: 'additionalField' }]));

  const properties = { ...baseSchema.properties, ...additionalPropertySchema };
  return { ...baseSchema, properties };
};

export { getSchemaWithAdditionalFields };
