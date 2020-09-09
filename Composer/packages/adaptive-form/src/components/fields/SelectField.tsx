// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useMemo } from 'react';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import { FieldProps } from '@bfc/extension-client';
import formatMessage from 'format-message';

import { FieldLabel } from '../FieldLabel';

export const SelectField: React.FC<FieldProps<string | number>> = function SelectField(props) {
  const {
    description,
    enumOptions,
    id,
    label,
    onBlur = () => {},
    onChange,
    onFocus = () => {},
    value = '',
    error,
    uiOptions,
    required,
  } = props;

  const options: IDropdownOption[] = useMemo(() => {
    const opts = (enumOptions ?? []).map((o) => ({
      key: o?.toString(),
      text: o?.toString(),
    }));

    opts.unshift({
      key: '',
      text: '',
    });

    return opts;
  }, [enumOptions]);

  const handleChange = (_e: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    /* istanbul ignore else */
    if (option) {
      onChange(option.key);
    } else {
      onChange(undefined);
    }
  };

  return (
    <>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      <Dropdown
        ariaLabel={label || formatMessage('selection field')}
        data-testid="SelectFieldDropdown"
        errorMessage={error as string}
        id={id}
        options={options}
        responsiveMode={ResponsiveMode.large}
        selectedKey={value}
        styles={{
          errorMessage: { display: 'none' },
        }}
        onBlur={() => onBlur(id, value)}
        onChange={handleChange}
        onFocus={() => onFocus(id, value)}
      />
    </>
  );
};
