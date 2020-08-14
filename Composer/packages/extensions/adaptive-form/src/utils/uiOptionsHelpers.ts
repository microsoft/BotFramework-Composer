// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldProps } from '@bfc/extension';
import startCase from 'lodash/startCase';

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

  return label || schema?.title || startCase(name);
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

  let fieldUIPlaceholder = '';

  if (uiPlaceholder) {
    fieldUIPlaceholder = typeof uiPlaceholder === 'function' ? uiPlaceholder(value) : uiPlaceholder;
  } else if (placeholder) {
    fieldUIPlaceholder = placeholder;
  } else if (schema && Array.isArray(schema.examples) && schema.examples.length > 0) {
    fieldUIPlaceholder = `ex. ${schema.examples.join(', ')}`;
  }

  if (fieldUIPlaceholder && schema.pattern) {
    const regex = `${schema.pattern}`;
    const placeholderExamples = fieldUIPlaceholder.split(',').map((example) => example.trim());
    const filteredExamples = placeholderExamples.filter((example) => example.match(regex));
    fieldUIPlaceholder = filteredExamples.join(', ');
  }

  return fieldUIPlaceholder !== '' ? fieldUIPlaceholder : undefined;
}
