import React from 'react';
import { TextField } from 'office-ui-fabric-react';
import { WidgetProps } from '@bfcomposer/react-jsonschema-form';

export const TextareaWidget: React.FunctionComponent<WidgetProps> = props => {
  const { label, onBlur, onChange, onFocus, readonly, value, placeholder, schema, id, disabled } = props;
  const { description, examples = [] } = schema;

  let placeholderText = placeholder;

  if (!placeholderText && examples.length > 0) {
    placeholderText = `ex. ${examples.join(', ')}`;
  }

  return (
    <TextField
      description={description}
      disabled={disabled}
      id={id}
      label={label}
      multiline
      onBlur={() => onBlur(id, value)}
      onChange={(_, newValue?: string) => onChange(newValue)}
      onFocus={() => onFocus(id, value)}
      placeholder={placeholderText}
      readOnly={readonly}
      value={value}
    />
  );
};

TextareaWidget.defaultProps = {
  schema: {},
};
