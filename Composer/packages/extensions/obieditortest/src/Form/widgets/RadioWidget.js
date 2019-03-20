import React from 'react';
import PropTypes from 'prop-types';
import { ChoiceGroup } from 'office-ui-fabric-react';

export function RadioWidget(props) {
  const { label, onChange, value, options, ...rest } = props;

  const choices = (options.enumOptions || []).map(o => ({
    key: o.value,
    text: o.label,
  }));

  return (
    <ChoiceGroup
      {...rest}
      label={label}
      onChange={(e, option) => onChange(option.key)}
      options={choices}
      selectedKey={value}
    />
  );
}

RadioWidget.propTypes = {
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
  placeholder: PropTypes.string,
  value: PropTypes.any,
};
