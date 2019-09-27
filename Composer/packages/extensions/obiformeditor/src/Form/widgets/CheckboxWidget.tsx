import React from 'react';
import { Checkbox } from 'office-ui-fabric-react';
import { WidgetProps } from '@bfcomposer/react-jsonschema-form';

import { WidgetLabel } from './WidgetLabel';

export function CheckboxWidget(props: WidgetProps) {
  const { onChange, onBlur, onFocus, value, label, id, schema } = props;
  const { description } = schema;

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginTop: '14px' }}>
      <Checkbox
        id={id}
        checked={Boolean(value)}
        onChange={(_, checked?: boolean) => onChange(checked)}
        onBlur={() => onBlur(id, Boolean(value))}
        onFocus={() => onFocus(id, Boolean(value))}
      />
      <WidgetLabel label={label} description={description} id={id} inline />
    </div>
  );
}
