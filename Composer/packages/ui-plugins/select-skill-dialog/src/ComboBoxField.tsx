// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { ComboBox, IComboBoxOption } from '@fluentui/react/lib/ComboBox';
import { FieldLabel } from '@bfc/adaptive-form';
import { Icon } from '@fluentui/react/lib/Icon';
import { ISelectableOption } from '@fluentui/react/lib/utilities/selectableOption';
import { IRenderFunction } from '@fluentui/react/lib/Utilities';
import { SharedColors } from '@fluentui/theme';

export const ADD_DIALOG = 'ADD_DIALOG';

interface ComboBoxFieldProps {
  comboboxTitle?: string;
  options: IComboBoxOption[];
  onChange: any;
  required?: boolean;
  description: string;
  id: string;
  label: string;
  value: string;
}

export const ComboBoxField: React.FC<ComboBoxFieldProps> = ({
  comboboxTitle,
  description,
  id,
  label,
  options,
  value = '',
  required,
  onChange,
}) => {
  const onRenderOption: IRenderFunction<ISelectableOption> = (option) =>
    option ? (
      <div>
        <Icon
          aria-hidden="true"
          iconName={option.key === ADD_DIALOG ? 'Add' : 'OpenSource'}
          style={{ marginRight: '5px', marginTop: '2px', color: SharedColors.cyanBlue10 }}
        />
        <span>{option.text}</span>
      </div>
    ) : null;

  return (
    <React.Fragment>
      <FieldLabel description={description} id={id} label={label} required={required} />
      <ComboBox
        useComboBoxAsMenuWidth
        autoComplete="off"
        id={id}
        options={options}
        selectedKey={comboboxTitle ? 'customTitle' : value}
        onItemClick={onChange}
        onRenderOption={onRenderOption}
      />
    </React.Fragment>
  );
};

export default ComboBoxField;
