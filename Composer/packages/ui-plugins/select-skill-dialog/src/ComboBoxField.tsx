// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { ComboBox, IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { ISelectableOption } from 'office-ui-fabric-react/lib/utilities/selectableOption';
import { IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';

export const ADD_DIALOG = 'ADD_DIALOG';

interface ComboBoxFieldProps {
  comboboxTitle: string | null;
  id: string;
  options: IComboBoxOption[];
  value: string;
  onChange: any;
}

export const ComboBoxField: React.FC<ComboBoxFieldProps> = ({ comboboxTitle, id, options, value = '', onChange }) => {
  const onRenderOption: IRenderFunction<ISelectableOption> = (option) =>
    option ? (
      <div>
        <Icon
          aria-hidden="true"
          iconName={option.key === ADD_DIALOG ? 'Add' : 'OpenSource'}
          style={{ marginRight: '8px' }}
        />
        <span>{option.text}</span>
      </div>
    ) : null;

  return (
    <ComboBox
      useComboBoxAsMenuWidth
      autoComplete="off"
      id={id}
      options={options}
      selectedKey={comboboxTitle ? 'customTitle' : value}
      onItemClick={onChange}
      onRenderOption={onRenderOption}
    />
  );
};

export default ComboBoxField;
