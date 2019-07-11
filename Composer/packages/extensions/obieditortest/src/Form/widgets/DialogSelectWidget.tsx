import React from 'react';

import { BFDWidgetProps } from '../types';

import { SelectWidget } from './SelectWidget';

export const DialogSelectWidget: React.FC<BFDWidgetProps> = props => {
  const { formContext } = props;

  const options = (formContext.dialogOptions || [])
    .filter(d => d !== formContext.dialogName)
    .map(d => ({ value: d, label: d }));

  return <SelectWidget {...props} options={{ enumOptions: options }} />;
};
