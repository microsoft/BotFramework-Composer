import React from 'react';
import { WidgetProps } from 'react-jsonschema-form';

import { SelectWidget } from './SelectWidget';

export const DialogSelectWidget: React.FC<WidgetProps> = props => {
  const { formContext } = props;

  return (
    <SelectWidget
      {...props}
      options={{ enumOptions: (formContext.dialogOptions || []).map(d => ({ value: d, label: d })) }}
    />
  );
};
