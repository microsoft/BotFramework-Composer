import React from 'react';
import { Dropdown } from 'office-ui-fabric-react';

export function SelectWidget(props) {
  const onChange = (e, option) => {
    props.onChange(option.key);
  };

  return (
    <Dropdown
      {...props}
      selectedKey={props.value}
      onChange={onChange}
      label={props.label}
      options={props.options.enumOptions.map(o => ({
        key: o.value,
        text: o.label,
      }))}
    />
  );
}
