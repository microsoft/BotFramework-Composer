// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { JsonEditor } from '@bfc/code-editor';
import { FieldProps, useFormConfig, useShellApi } from '@bfc/extension';
import { css, jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import React, { useMemo, useState } from 'react';

import { getUiPlaceholder, resolveFieldWidget } from '../../../utils';
import { FieldLabel } from '../../FieldLabel';

import { ExpressionEditor } from './ExpressionEditor';
import { getOptions, getSelectedOption, SchemaOption } from './utils';

const styles = {
  container: css`
    width: 100%;

    label: ExpressionFieldContainer;
  `,
  field: css`
    min-height: 66px;
  `,
  labelContainer: css`
    display: flex;
    justify-content: space-between;
    align-items: center;

    label: ExpressionField;
  `,
};

const ExpressionField: React.FC<FieldProps> = (props) => {
  const { id, value, label, description, schema, uiOptions, definitions, required, className } = props;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { $role, ...expressionSchema } = schema;
  const formUIOptions = useFormConfig();
  const { userSettings } = useShellApi();

  const options = useMemo(() => getOptions(expressionSchema, definitions), []);
  const initialSelectedOption = useMemo(
    () => getSelectedOption(value, options) || ({ key: '', data: { schema: {} } } as SchemaOption),
    []
  );

  const [
    {
      key: selectedKey,
      data: { schema: selectedSchema },
    },
    setSelectedOption,
  ] = useState<SchemaOption>(initialSelectedOption);

  const handleTypeChange = (_e: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    if (option && option.key !== selectedKey) {
      setSelectedOption(option as SchemaOption);
      props.onChange(undefined);
    }
  };

  const renderTypeTitle = (options?: IDropdownOption[]) => {
    const option = options && options[0];
    return option ? <React.Fragment>{option.text}</React.Fragment> : null;
  };

  const renderField = () => {
    if (!selectedSchema || Array.isArray(selectedSchema.type) || !selectedSchema.type) {
      return null;
    }
    // attempt to get a placeholder with the selected schema
    const placeholder = getUiPlaceholder({ ...props, schema: selectedSchema }) || props.placeholder;
    const enumOptions = selectedSchema?.enum as string[];

    if (selectedKey === 'expression') {
      return <ExpressionEditor {...props} placeholder={placeholder} />;
    }

    // return a json editor for open ended obejcts
    if (
      (selectedSchema.type === 'object' && !selectedSchema.properties) ||
      (selectedSchema.type === 'array' && !selectedSchema.items && !selectedSchema.oneOf)
    ) {
      const defaultValue = selectedSchema.type === 'object' ? {} : [];
      return (
        <JsonEditor
          key={selectedSchema.type}
          editorSettings={userSettings.codeEditor}
          height={100}
          id={props.id}
          schema={selectedSchema}
          value={value || defaultValue}
          onChange={props.onChange}
        />
      );
    }

    const Field = resolveFieldWidget(selectedSchema, uiOptions, formUIOptions);
    return (
      <Field
        key={selectedSchema.type}
        {...props}
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

  const shouldRenderContainer = label || (options && options.length > 1);
  const dropdownWidth = useMemo(
    () => (options.reduce((maxLength, { text }) => Math.max(maxLength, text.length), 0) > 'expression'.length ? -1 : 0),
    [options]
  );

  return (
    <div className={className} css={styles.container}>
      {shouldRenderContainer && (
        <div css={styles.labelContainer}>
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
              data-testid={`expression-type-dropdown-${label}`}
              dropdownWidth={dropdownWidth}
              id={`${props.id}-type`}
              options={options}
              responsiveMode={ResponsiveMode.large}
              selectedKey={selectedKey}
              styles={{
                caretDownWrapper: { height: '24px', lineHeight: '24px' },
                root: { flexBasis: 'auto', padding: '5px 0', minWidth: '110px' },
                title: { height: '24px', lineHeight: '20px' },
              }}
              onChange={handleTypeChange}
              onRenderTitle={renderTypeTitle}
            />
          )}
        </div>
      )}
      {renderField()}
    </div>
  );
};

export { ExpressionField };
