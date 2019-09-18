import React from 'react';
import { Checkbox } from 'office-ui-fabric-react';
import { WidgetProps } from '@bfcomposer/react-jsonschema-form';

export function CheckboxWidget(props: WidgetProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onChange, onBlur, onFocus, value, label, ...rest } = props;

  return (
    <Checkbox
      {...rest}
      checked={Boolean(value)}
      onChange={(_, checked?: boolean) => onChange(checked)}
      onBlur={() => onBlur(rest.id, Boolean(value))}
      onFocus={() => onFocus(rest.id, Boolean(value))}
    />
  );
}
