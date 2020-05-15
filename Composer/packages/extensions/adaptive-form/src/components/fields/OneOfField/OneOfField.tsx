// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useMemo } from 'react';
import { FieldProps } from '@bfc/extension';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';

import { FieldLabel } from '../../FieldLabel';
import { resolveFieldWidget } from '../../../utils';
import { usePluginConfig } from '../../../hooks';
import { oneOfField } from '../styles';

import { getOptions, getSelectedOption, getFieldProps } from './utils';

const OneOfField: React.FC<FieldProps> = props => {
  const { definitions, description, id, label, schema, required, uiOptions, value } = props;
  const pluginConfig = usePluginConfig();
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

  const renderTypeTitle = (options?: IDropdownOption[]) => {
    const option = options && options[0];
    return option ? <React.Fragment>{option.text}</React.Fragment> : null;
  };

  const Field = resolveFieldWidget(selectedSchema || {}, props.uiOptions, pluginConfig);

  return (
    <div css={oneOfField.container}>
      <div css={oneOfField.label}>
        <FieldLabel
          id={id}
          label={label}
          description={description}
          helpLink={uiOptions?.helpLink}
          required={required}
        />
        {options && options.length > 1 && (
          <Dropdown
            id={`${props.id}-oneOf`}
            options={options}
            responsiveMode={ResponsiveMode.large}
            selectedKey={selectedKey}
            onChange={handleTypeChange}
            onRenderTitle={renderTypeTitle}
            styles={{
              caretDownWrapper: { height: '24px', lineHeight: '24px' },
              root: { flexBasis: 'auto', padding: '5px 0', minWidth: '110px' },
              title: { height: '24px', lineHeight: '20px' },
            }}
            ariaLabel={formatMessage('select property type')}
          />
        )}
      </div>
      <Field {...getFieldProps(props, selectedSchema)} />
    </div>
  );
};

export { OneOfField };
