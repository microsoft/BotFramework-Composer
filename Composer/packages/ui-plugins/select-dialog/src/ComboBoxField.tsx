// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { ComboBox, IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import { FieldLabel } from '@bfc/adaptive-form';
import { FieldProps } from '@bfc/extension-client';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { ISelectableOption } from 'office-ui-fabric-react/lib/utilities/selectableOption';
import { IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';

export const ADD_DIALOG = 'ADD_DIALOG';

interface ComboBoxFieldProps extends FieldProps {
  comboboxTitle: string | null;
  options: IComboBoxOption[];
  onChange: any;
}

const getIconName = (key: string) => {
  if (key === ADD_DIALOG) {
    return 'Add';
  } else if (key === 'expression') {
    return 'CalculatorEqualTo';
  } else {
    return 'OpenSource';
  }
};

export const ComboBoxField: React.FC<ComboBoxFieldProps> = (props) => {
  const {
    comboboxTitle,
    description,
    id,
    label,
    options,
    value = '',
    required,
    uiOptions,
    onBlur,
    onChange,
    onFocus,
  } = props;
  const onRenderOption: IRenderFunction<ISelectableOption> = (option) =>
    option ? (
      <div>
        <Icon aria-hidden="true" iconName={getIconName(option.key as string)} style={{ marginRight: '8px' }} />
        <span>{option.text}</span>
      </div>
    ) : null;

  return (
    <React.Fragment>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      <ComboBox
        useComboBoxAsMenuWidth
        autoComplete="off"
        id={id}
        options={options}
        selectedKey={comboboxTitle ? 'customTitle' : value}
        onBlur={() => onBlur?.(id, value)}
        onFocus={() => onFocus?.(id, value)}
        onItemClick={onChange}
        onRenderOption={onRenderOption}
      />
    </React.Fragment>
  );
};

export default ComboBoxField;
