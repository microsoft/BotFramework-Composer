import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'office-ui-fabric-react';

export function CheckboxWidget(props) {
  const { label, onChange, value, ...rest } = props;

  return <Checkbox {...rest} checked={Boolean(value)} onChange={e => onChange(e.target.checked)} label={label} />;
}

CheckboxWidget.propTypes = {
  label: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.any,
};
