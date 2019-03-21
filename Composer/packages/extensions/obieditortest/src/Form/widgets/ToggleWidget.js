import React from 'react';
import PropTypes from 'prop-types';
import { Toggle } from 'office-ui-fabric-react';

export function ToggleWidget(props) {
  const { label, onChange, value, ...rest } = props;

  const handleChange = (e, val) => {
    onChange(val);
  };

  return <Toggle {...rest} checked={value} onChange={handleChange} label={label} />;
}

ToggleWidget.propTypes = {
  label: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.any,
};
