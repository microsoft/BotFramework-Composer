// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { ComboBox, IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import { FieldLabel } from '@bfc/adaptive-form';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { ISelectableOption } from 'office-ui-fabric-react/lib/utilities/selectableOption';
import { IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';
import { SharedColors } from '@uifabric/fluent-theme';

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
