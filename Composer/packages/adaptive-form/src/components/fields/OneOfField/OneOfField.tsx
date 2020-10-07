// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */

import { FieldProps, useFormConfig } from '@bfc/extension-client';
import { jsx } from '@emotion/core';
import { SharedColors } from '@uifabric/fluent-theme/lib/fluent';
import formatMessage from 'format-message';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import React, { useMemo, useState } from 'react';

import { getUiPlaceholder, resolveFieldWidget } from '../../../utils';
import { FieldLabel } from '../../FieldLabel';
import { oneOfField } from '../styles';

import { getOptions, getSelectedOption } from './utils';

const onRenderOption = (option?: IDropdownOption): JSX.Element => {
  return (
    <div>
      {option?.data && option?.data?.icon && (
        <Icon aria-hidden="true" iconName={option.data.icon} style={{ marginRight: '8px' }} title={option.data.icon} />
      )}
      <span>{option?.text}</span>
    </div>
  );
};

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

  const renderField = () => {
    if (!selectedSchema || Array.isArray(selectedSchema.type) || !selectedSchema.type) {
      return null;
    }
    // attempt to get a placeholder with the selected schema
    const placeholder = getUiPlaceholder({ ...props, schema: selectedSchema }) || props.placeholder;
    const enumOptions = selectedSchema?.enum as string[];
    const expression = schema?.oneOf?.some(({ $role }: any) => $role === 'expression');

    const { field: Field, customProps } = resolveFieldWidget(selectedSchema, uiOptions, formUIOptions, value);
    return (
      <Field
        expression={expression}
        key={selectedSchema.type}
        {...props}
        {...customProps}
        css={{ label: 'ExpressionFieldValue' }}
        enumOptions={enumOptions}
        label={selectedSchema.type !== 'object' ? false : undefined}
        // allow object fields to render their labels
        placeholder={placeholder}
        schema={selectedSchema}
        transparentBorder={false}
        uiOptions={{ ...props.uiOptions, helpLink: 'https://bing.com' }}
      />
    );
  };

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
            dropdownWidth={-1}
            id={`${props.id}-oneOf`}
            options={options}
            responsiveMode={ResponsiveMode.large}
            selectedKey={selectedKey}
            styles={{
              caretDown: { color: SharedColors.cyanBlue10 },
              caretDownWrapper: { height: '20px', lineHeight: '20px' },
              root: { flexBasis: 'auto', paddingBottom: '-4px' },
              title: {
                border: 'none',
                color: SharedColors.cyanBlue10,
                height: '20px',
                lineHeight: '20px',
              },
            }}
            onChange={handleTypeChange}
            onRenderOption={onRenderOption}
          />
        )}
      </div>
      {renderField()}
    </div>
  );
};

export { OneOfField };
