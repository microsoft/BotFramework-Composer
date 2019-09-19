import React from 'react';
import { Toggle } from 'office-ui-fabric-react';
import { WidgetProps } from '@bfcomposer/react-jsonschema-form';

import { WidgetLabel } from './WidgetLabel';

export function ToggleWidget(props: WidgetProps) {
  const { label, onChange, value, id, schema } = props;
  const { description } = schema;

  const handleChange = (e, val) => {
    onChange(val);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginTop: '14px' }}>
      <Toggle id={id} checked={value} onChange={handleChange} styles={{ root: { marginBottom: '0' } }} />
      <WidgetLabel label={label} description={description} id={id} inline />
    </div>
  );
}
