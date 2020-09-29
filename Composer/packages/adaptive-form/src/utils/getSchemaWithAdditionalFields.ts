// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7, UIOptions } from '@bfc/extension-client';
import fromPairs from 'lodash/fromPairs';
import toPairs from 'lodash/toPairs';

const getSchemaWithAdditionalFields = (baseSchema: JSONSchema7, uiOptions: UIOptions): JSONSchema7 => {
  const additionalFields = toPairs(uiOptions.properties).filter(([, { additionalField }]) => additionalField);
  const additionalPropertySchema = fromPairs(additionalFields.map(([field]) => [field, {}]));

  const properties = { ...additionalPropertySchema, ...baseSchema.properties };
  return { ...baseSchema, properties };
};

export { getSchemaWithAdditionalFields };
