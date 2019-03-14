import React from 'react';
import { TextField } from 'office-ui-fabric-react';

export function TextWidget(props) {
  return (
    <TextField {...props} value={props.value} onChange={e => props.onChange(e.target.value)} label={props.label} />
  );
}
