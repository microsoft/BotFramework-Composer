import React from 'react';
import { Checkbox } from 'office-ui-fabric-react';
import { WidgetProps } from '@bfdesigner/react-jsonschema-form';

export function CheckboxWidget(props: WidgetProps) {
  const { label, onChange, onBlur, onFocus, value, ...rest } = props;

  return (
    <Checkbox
      {...rest}
      checked={Boolean(value)}
      onChange={(_, checked?: boolean) => onChange(checked)}
      onBlur={() => onBlur(rest.id, Boolean(value))}
      onFocus={() => onFocus(rest.id, Boolean(value))}
      label={label}
    />
  );
}
