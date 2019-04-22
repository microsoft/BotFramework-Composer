import React from 'react';
import get from 'lodash.get';
import { FieldTemplateProps } from 'react-jsonschema-form';

/**
 * Use ui:options.span to control how many fields on a row
 */

export default function FieldTemplate(props: FieldTemplateProps) {
  const { children, label, uiSchema } = props;

  const hidden = get(uiSchema, 'ui:widget') === 'hidden';

  if (hidden || (label && label.startsWith('$'))) {
    return null;
  }

  const span = get(uiSchema, 'ui:options.span');

  const style = {
    gridColumnEnd: span ? `span ${span}` : undefined,
  };

  return <div style={style}>{children}</div>;
}
