import React from 'react';
import { Toggle } from 'office-ui-fabric-react';
import { WidgetProps } from '@bfcomposer/react-jsonschema-form';

export function ToggleWidget(props: WidgetProps) {
  const { label, onChange, value } = props;

  const handleChange = (e, val) => {
    onChange(val);
  };

  return <Toggle checked={value} onChange={handleChange} label={label} />;
}
