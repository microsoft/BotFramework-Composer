import React from 'react';
import { DatePicker } from 'office-ui-fabric-react';
import { WidgetProps } from '@bfdesigner/react-jsonschema-form';

export function DateTimeWidget(props: WidgetProps) {
  const { onChange, onBlur, onFocus, required, value, schema, ...rest } = props;
  const { description } = schema;

  const onSelectDate = (date?: Date | null) => {
    onChange(date ? date.toISOString() : null);
  };

  return (
    <DatePicker
      {...rest}
      isRequired={required}
      onBlur={() => onBlur(rest.id, value)}
      onFocus={() => onFocus(rest.id, value)}
      onSelectDate={onSelectDate}
      textField={{ description }}
      value={value ? new Date(value) : undefined}
    />
  );
}

DateTimeWidget.defaultProps = {
  schema: {},
};
