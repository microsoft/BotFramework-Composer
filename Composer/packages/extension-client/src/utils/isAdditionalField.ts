// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AdditionalField, UIOptions } from '../types/formSchema';

export const isAdditionalField = (uiOptions?: UIOptions | AdditionalField): uiOptions is AdditionalField => {
  return typeof uiOptions !== 'undefined' && 'additionalField' in uiOptions && uiOptions?.additionalField;
};
