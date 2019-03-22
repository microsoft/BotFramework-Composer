import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'office-ui-fabric-react';

export function SelectWidget(props) {
  const { label, onChange, value, options, ...rest } = props;

  const handleChange = (e, option) => {
    onChange(option.key);
  };

  return (
    <Dropdown
      {...rest}
      label={label}
      onChange={handleChange}
      options={options.enumOptions.map(o => ({
        key: o.value,
        text: o.label,
      }))}
      selectedKey={value}
    />
  );
}

SelectWidget.propTypes = {
  label: PropTypes.string,
  onChange: PropTypes.func,
  options: PropTypes.shape({
    enumOptions: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.any,
      })
    ),
  }),
  value: PropTypes.any,
};
