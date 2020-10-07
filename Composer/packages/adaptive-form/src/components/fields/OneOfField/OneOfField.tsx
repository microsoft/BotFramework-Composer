// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */

import { FieldProps, useFormConfig } from '@bfc/extension-client';
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import React, { useMemo, useState } from 'react';

import { getUiPlaceholder, resolveFieldWidget } from '../../../utils';
import { FieldLabel } from '../../FieldLabel';
import { oneOfField } from '../styles';

import { getOptions, getSelectedOption } from './utils';

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

    const { field: Field, customProps } = resolveFieldWidget(selectedSchema, uiOptions, formUIOptions, value);
    return (
      <Field
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
      {renderField()}
    </div>
  );
};

export { OneOfField };
