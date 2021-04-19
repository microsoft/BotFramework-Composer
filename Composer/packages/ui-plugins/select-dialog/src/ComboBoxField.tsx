// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { ComboBox, IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import { FieldLabel } from '@bfc/adaptive-form';
import { FieldProps } from '@bfc/extension-client';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { ISelectableOption } from 'office-ui-fabric-react/lib/utilities/selectableOption';
import { IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';
import { Icons } from '@bfc/shared';
import { SharedColors } from '@uifabric/fluent-theme';

export const ADD_DIALOG = 'ADD_DIALOG';

interface ComboBoxFieldProps extends FieldProps {
  comboboxTitle: string | null;
  options: IComboBoxOption[];
  onChange: any;
}

const getIconName = (option: IComboBoxOption) => {
  if (option.key === ADD_DIALOG) {
    return 'Add';
  } else if (option.key === 'expression') {
    return 'CalculatorEqualTo';
  } else if (option.data?.isTopic) {
    const isSystemTopic = option.data.content?.isSystemTopic;
    return isSystemTopic ? Icons.SYSTEM_TOPIC : Icons.TOPIC;
  } else {
    return Icons.DIALOG;
  }
};

const getIconStyles = (option: IComboBoxOption) => {
  if ([ADD_DIALOG, 'expression'].includes(option.key as string)) {
    return { color: SharedColors.cyanBlue10 };
  }

  return {};
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
      <React.Fragment>
        <Icon
          aria-hidden="true"
          iconName={getIconName(option)}
          style={{ marginRight: '5px', marginTop: '2px', ...getIconStyles(option) }}
        />
        <span>{option.text}</span>
      </React.Fragment>
    ) : null;

  return (
    <React.Fragment>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      <ComboBox
        useComboBoxAsMenuWidth
        autoComplete="on"
        id={id}
        options={options}
        selectedKey={comboboxTitle ? 'customTitle' : value}
        styles={{ optionsContainerWrapper: { maxHeight: '540px' } }}
        onBlur={() => onBlur?.(id, value)}
        onChange={onChange}
        onFocus={() => onFocus?.(id, value)}
        onRenderOption={onRenderOption}
      />
    </React.Fragment>
  );
};

export default ComboBoxField;
