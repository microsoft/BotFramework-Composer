import React from 'react';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';

export const UnsupportedField: React.FC<FieldProps> = props => {
  return (
    <div>
      unsupported field: {`<${props.fieldName} />`} ({props.schema.title})
    </div>
  );
};
