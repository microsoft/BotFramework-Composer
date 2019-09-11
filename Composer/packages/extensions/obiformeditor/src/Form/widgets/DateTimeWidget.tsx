import React from 'react';
import { DatePicker } from 'office-ui-fabric-react';
import { WidgetProps } from '@bfcomposer/react-jsonschema-form';
import omit from 'lodash.omit';

export function DateTimeWidget(props: WidgetProps) {
  const { onChange, onBlur, onFocus, required, value, ...rest } = props;

  const onSelectDate = (date?: Date | null) => {
    onChange(date ? date.toISOString() : null);
  };

  return (
    <DatePicker
      {...omit(rest, ['label', 'description'])}
      isRequired={required}
      onBlur={() => onBlur(rest.id, value)}
      onFocus={() => onFocus(rest.id, value)}
      onSelectDate={onSelectDate}
      value={value ? new Date(value) : undefined}
    />
  );
}

DateTimeWidget.defaultProps = {
  schema: {},
};
