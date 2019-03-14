import React from 'react';
import get from 'lodash.get';

/**
 * Use ui:options.span to control how many fields on a row
 */

export default function FieldTemplate(props) {
  const { children, uiSchema } = props;

  const hidden = get(uiSchema, 'ui:widget') === 'hidden';

  if (hidden) {
    return null;
  }

  const span = get(uiSchema, 'ui:options.span');

  const style = {
    gridColumnEnd: span ? `span ${span}` : null,
  };

  return <div style={style}>{children}</div>;
}
