// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { ComboBox, IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import { FieldLabel } from '@bfc/adaptive-form';
import { FieldProps } from '@bfc/extension';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { ISelectableOption } from 'office-ui-fabric-react/lib/utilities/selectableOption';
import { IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';

export const ADD_DIALOG = 'ADD_DIALOG';

interface ComboBoxFieldProps extends FieldProps {
  comboboxTitle: string | null;
  options: IComboBoxOption[];
  onChange: any;
}

export const ComboBoxField: React.FC<ComboBoxFieldProps> = ({
  comboboxTitle,
  description,
  id,
  label,
  options,
  value = '',
  uiOptions,
  onBlur,
  onChange,
  onFocus,
}) => {
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
    <React.Fragment>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} />
      <ComboBox
        autoComplete="off"
        id={id}
        onBlur={() => onBlur && onBlur(id, value)}
        onFocus={() => onFocus && onFocus(id, value)}
        onItemClick={onChange}
        onRenderOption={onRenderOption}
        options={options}
        selectedKey={comboboxTitle ? 'customTitle' : value}
        useComboBoxAsMenuWidth
      />
    </React.Fragment>
  );
};

export default ComboBoxField;
