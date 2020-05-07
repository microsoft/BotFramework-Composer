// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import get from 'lodash/get';
import { FIELDS_TO_HIDE } from '@bfc/shared';
export default function FieldTemplate(props) {
  var children = props.children,
    label = props.label,
    uiSchema = props.uiSchema;
  var hidden = get(uiSchema, 'ui:widget') === 'hidden' || get(uiSchema, 'ui:field') === 'NullField';
  if (hidden || (label && FIELDS_TO_HIDE.includes(label.toLowerCase()))) {
    return null;
  }
  return React.createElement('div', { className: 'FieldTemplate' }, children);
}
//# sourceMappingURL=FieldTemplate.js.map
