// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldProps } from '@bfc/extension';

export function getUiLabel(props: FieldProps): string | false | undefined {
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

export function getUiDescription(props: FieldProps): string | undefined {
  const { uiOptions, schema, value, description } = props;

  const { description: uiDescription } = uiOptions;

  if (uiDescription) {
    return typeof uiDescription === 'function' ? uiDescription(value) : uiDescription;
  }

  return description || schema?.description;
}

export function getUiPlaceholder(props: FieldProps): string | undefined {
  const { uiOptions, schema, value, placeholder } = props;

  const { placeholder: uiPlaceholder } = uiOptions;

  if (uiPlaceholder) {
    return typeof uiPlaceholder === 'function' ? uiPlaceholder(value) : uiPlaceholder;
  }

  if (placeholder) {
    return placeholder;
  }

  if (schema && (schema.examples || []).length > 0) {
    return `ex. ${schema.examples.join(', ')}`;
  }
}
