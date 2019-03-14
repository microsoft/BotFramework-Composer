import React from 'react';
import { DatePicker } from 'office-ui-fabric-react';

export function DateTimeWidget(props) {
  const onChange = date => {
    props.onChange(date.toISOString());
  };

  return (
    <DatePicker
      {...props}
      onSelectDate={onChange}
      value={props.value ? new Date(props.value) : null}
      isRequired={props.required}
    />
  );
}
