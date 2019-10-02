import React from 'react';
import { DatePicker } from 'office-ui-fabric-react';

import { BFDWidgetProps } from '../types';

import { WidgetLabel } from './WidgetLabel';

export function DateTimeWidget(props: BFDWidgetProps) {
  const { onChange, onBlur, onFocus, required, value, label, id, schema } = props;
  const { description } = schema;

  const onSelectDate = (date?: Date | null) => {
    onChange(date ? date.toISOString() : null);
  };

  return (
    <>
      <WidgetLabel label={label} description={description} id={id} />
      <DatePicker
        id={id}
        isRequired={required}
        onBlur={() => onBlur && onBlur(id, value)}
        onFocus={() => onFocus && onFocus(id, value)}
        onSelectDate={onSelectDate}
        value={value ? new Date(value) : undefined}
      />
    </>
  );
}

DateTimeWidget.defaultProps = {
  schema: {},
};
