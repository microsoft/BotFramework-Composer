// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo } from 'react';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import { FieldLabel } from '@bfc/adaptive-form';
import { FieldProps } from '@bfc/extension';
import startCase from 'lodash/startCase';

import { useDialogSchemaContext } from './DialogSchemaContext';

export const RefField: React.FC<FieldProps> = ({ description, id, label, value, required, onChange }) => {
  const { schema } = useDialogSchemaContext();

  const expressions = useMemo(
    () =>
      Object.entries(schema?.definitions || {}).reduce(
        (acc, [key, value]: [string, any]) => (value.$role === 'expression' ? { ...acc, [key]: value } : acc),
        {}
      ),
    [schema]
  );

  const options = useMemo<IDropdownOption[]>(() => {
    return Object.keys(expressions || {}).map((key) => ({
      key: `#/definitions/${key}`,
      text: startCase(key),
    }));
  }, [expressions]);

  const handleChange = (_, option?: IDropdownOption) => {
    if (option?.key) {
      onChange(option.key);
    }
  };

  return (
    <React.Fragment>
      <FieldLabel description={description} id={id} label={label} required={required} />
      <Dropdown
        id={id}
        options={options}
        responsiveMode={ResponsiveMode.large}
        selectedKey={value}
        styles={{
          root: { width: '100%' },
          errorMessage: { display: 'none' },
        }}
        onChange={handleChange}
      />
    </React.Fragment>
  );
};
