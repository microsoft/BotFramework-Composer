import React from 'react';
import { Toggle } from 'office-ui-fabric-react';

export function ToggleWidget(props) {
  const onChange = (e, val) => {
    props.onChange(val);
  };

  return <Toggle {...props} {...props.options} checked={props.value} onChange={onChange} label={props.label} />;
}
