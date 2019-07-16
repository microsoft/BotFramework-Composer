import React from 'react';

import { BFDWidgetProps } from '../types';

import { SelectWidget } from './SelectWidget';

export const DialogSelectWidget: React.FC<BFDWidgetProps> = props => {
  const { formContext } = props;

  const options = (formContext.dialogOptions || []).filter(d => d.value !== formContext.currentDialog.id);

  return <SelectWidget {...props} options={{ enumOptions: options }} />;
};
