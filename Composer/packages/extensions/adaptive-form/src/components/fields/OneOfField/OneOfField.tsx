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

import { getOptions, getSelectedOption } from './utils';

const OneOfField: React.FC<FieldProps> = (props) => {
  const { schema, value, definitions } = props;
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
        <FieldLabel {...props} />
        {options && options.length > 1 && (
          <Dropdown
            ariaLabel={formatMessage('select property type')}
            id={`${props.id}-oneOf`}
            onChange={handleTypeChange}
            onRenderTitle={renderTypeTitle}
            options={options}
            responsiveMode={ResponsiveMode.large}
            selectedKey={selectedKey}
            styles={{
              caretDownWrapper: { height: '24px', lineHeight: '24px' },
              root: { flexBasis: 'auto', padding: '5px 0', minWidth: '110px' },
              title: { height: '24px', lineHeight: '20px' },
            }}
          />
        )}
      </div>
      <Field
        {...props}
        depth={props.depth - 1}
        label={selectedSchema?.type === 'object' ? undefined : false}
        // allow object fields to render their labels
        schema={selectedSchema || {}}
        transparentBorder={false}
      />
    </div>
  );
};

export { OneOfField };
