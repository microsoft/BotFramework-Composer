// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldProps } from '@bfc/extension';

export function getLabel<T extends FieldProps = FieldProps>(props: T): string | false | undefined {
  const { uiOptions, schema, name, value, label } = props;

  if (label === false) {
    return false;
  }

  const { label: uiLabel } = uiOptions;

  if (uiLabel) {
    return typeof uiLabel === 'function' ? uiLabel(value) : uiLabel;
  } else if (uiLabel === false) {
    return false;
  }

  return label || schema?.title || name;
}
