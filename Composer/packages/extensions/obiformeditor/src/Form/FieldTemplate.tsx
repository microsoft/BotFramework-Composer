import React from 'react';
import get from 'lodash.get';
import { FieldTemplateProps } from '@bfcomposer/react-jsonschema-form';

import { FIELDS_TO_HIDE } from '../schema/appschema';

export default function FieldTemplate(props: FieldTemplateProps) {
  const { children, label, uiSchema } = props;

  const hidden = get(uiSchema, 'ui:widget') === 'hidden' || get(uiSchema, 'ui:field') === 'NullField';

  if (hidden || (label && FIELDS_TO_HIDE.includes(label.toLowerCase()))) {
    return null;
  }

  return <>{children}</>;
}
