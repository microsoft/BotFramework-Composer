// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FieldProps } from '@bfc/extension';
import { FieldLabel } from '@bfc/adaptive-form';
import { ComboBox, IComboBox, IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import formatMessage from 'format-message';

const EventNameField: React.FC<FieldProps<string>> = (props) => {
  const { enumOptions, value, description, id, label, uiOptions, onChange, error } = props;

  const options: IComboBoxOption[] = (enumOptions ?? []).map((o) => ({
    key: o?.toString(),
    text: o?.toString(),
  }));

  const handleChange = (e: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
    if (option) {
      onChange(option.key as string);
    } else if (value) {
      onChange(value);
    } else {
      onChange(undefined);
    }
  };

  return (
    <>
      <FieldLabel description={description} id={id} label={label} helpLink={uiOptions?.helpLink} />
      <ComboBox
        id={id}
        text={value}
        options={options}
        placeholder={formatMessage('Select event type or type a custom one')}
        allowFreeform
        autoComplete="on"
        onChange={handleChange}
        errorMessage={error as string}
        useComboBoxAsMenuWidth
        styles={{
          errorMessage: { display: 'none' },
        }}
      />
    </>
  );
};

export { EventNameField };
