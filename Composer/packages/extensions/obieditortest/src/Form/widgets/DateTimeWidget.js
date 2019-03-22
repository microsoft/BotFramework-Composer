import React from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from 'office-ui-fabric-react';

export function DateTimeWidget(props) {
  const { onChange, required, value, schema, ...rest } = props;
  const { description } = schema || {};

  const onSelectDate = date => {
    onChange(date.toISOString());
  };

  return (
    <DatePicker
      {...rest}
      isRequired={required}
      onSelectDate={onSelectDate}
      textField={{ description }}
      value={value ? new Date(value) : null}
    />
  );
}

DateTimeWidget.propTypes = {
  onChange: PropTypes.func,
  required: PropTypes.boolean,
  schema: PropTypes.shape({
    description: PropTypes.string,
  }),
  value: PropTypes.any,
};
