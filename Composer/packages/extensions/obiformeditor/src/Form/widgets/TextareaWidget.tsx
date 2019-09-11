import React from 'react';
import { TextField } from 'office-ui-fabric-react';
import { WidgetProps } from '@bfcomposer/react-jsonschema-form';

export const TextareaWidget: React.FunctionComponent<WidgetProps> = props => {
  const { onBlur, onChange, onFocus, readonly, value, placeholder, schema, id, disabled } = props;
  const { examples = [] } = schema;

  let placeholderText = placeholder;

  if (!placeholderText && examples.length > 0) {
    placeholderText = `ex. ${examples.join(', ')}`;
  }

  return (
    <TextField
      disabled={disabled}
      id={id}
      multiline
      onBlur={() => onBlur(id, value)}
      onChange={(_, newValue?: string) => onChange(newValue)}
      onFocus={() => onFocus(id, value)}
      placeholder={placeholderText}
      readOnly={readonly}
      value={value}
      styles={{
        subComponentStyles: {
          label: { root: { fontSize: '12px', fontWeight: '400' } },
        },
      }}
    />
  );
};

TextareaWidget.defaultProps = {
  schema: {},
};
