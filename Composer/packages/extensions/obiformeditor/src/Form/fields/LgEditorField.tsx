import React from 'react';

import { BFDFieldProps } from '../types';
import { LgEditorWidget } from '../widgets/LgEditorWidget';

import { BaseField } from './BaseField';

export const LgEditorField: React.FC<BFDFieldProps> = props => {
  return (
    <BaseField {...props}>
      <LgEditorWidget
        name={props.name}
        value={props.formData}
        formContext={props.formContext}
        onChange={props.onChange}
      />
    </BaseField>
  );
};
