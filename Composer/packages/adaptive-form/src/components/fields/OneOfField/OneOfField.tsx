// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useMemo } from 'react';
import { FieldProps, useFormConfig } from '@bfc/extension';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';

import { FieldLabel } from '../../FieldLabel';
import { resolveFieldWidget } from '../../../utils';
import { oneOfField } from '../styles';

import { getOptions, getSelectedOption, getFieldProps } from './utils';

const OneOfField: React.FC<FieldProps> = (props) => {
  const { definitions, description, id, label, schema, required, uiOptions, value } = props;
  const formUIOptions = useFormConfig();
  const options = useMemo(() => getOptions(schema, definitions), [schema, definitions]);
  const initialSelectedOption = useMemo(
    () => getSelectedOption(value, options) || ({ key: '', data: { schema: undefined } } as IDropdownOption),
    []
  );

  const [
    {
      key: selectedKey,
      data: { schema: selectedSchema },
    },
    setSelectedOption,
  ] = useState<IDropdownOption>(initialSelectedOption);

  const handleTypeChange = (_e: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    if (option) {
      setSelectedOption(option);
      props.onChange(undefined);
    }
  };

  const Field = resolveFieldWidget(selectedSchema || {}, props.uiOptions, formUIOptions);

  return (
    <div css={oneOfField.container}>
      <div css={oneOfField.label}>
        <FieldLabel
          description={description}
          helpLink={uiOptions?.helpLink}
          id={id}
          label={label}
          required={required}
        />
        {options && options.length > 1 && (
          <Dropdown
            ariaLabel={formatMessage('select property type')}
            data-testid="OneOfFieldType"
            id={`${props.id}-oneOf`}
            options={options}
            responsiveMode={ResponsiveMode.large}
            selectedKey={selectedKey}
            styles={{
              caretDownWrapper: { height: '24px', lineHeight: '24px' },
              root: { flexBasis: 'auto', padding: '5px 0', minWidth: '110px' },
              title: { height: '24px', lineHeight: '20px' },
            }}
            onChange={handleTypeChange}
          />
        )}
      </div>
      <Field {...getFieldProps(props, selectedSchema)} />
    </div>
  );
};

export { OneOfField };
