// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UIOptions } from '@bfc/extension';

export const globalHiddenProperties = ['$kind', '$id', '$copy', '$designer', 'id', 'disabled'];

export const getHiddenProperties = (uiOptions: UIOptions, value: any) => {
  const hiddenProperties = typeof uiOptions.hidden === 'function' ? uiOptions.hidden(value) : uiOptions.hidden || [];
  return new Set([...globalHiddenProperties, ...hiddenProperties]);
};

export const isPropertyHidden = (uiOptions: UIOptions, value: any, property: string) =>
  getHiddenProperties(uiOptions, value).has(property);
