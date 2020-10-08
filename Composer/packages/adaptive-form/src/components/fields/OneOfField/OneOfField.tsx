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
import { css } from '@emotion/core';

import { getUiPlaceholder, resolveFieldWidget } from '../../../utils';
import { FieldLabel } from '../../FieldLabel';

import { getOptions, getSelectedOption } from './utils';

const styles = {
  container: css`
    width: 100%;

    label: OneOfField;
  `,
  label: css`
    display: flex;
    justify-content: space-between;

    label: OneOfFieldLabel;
  `,

  fieldContainer: css`
    width: 100%;
    display: flex;
  `,

  icon: css`
    margin-right: 3px;
    font-size: 12px;
  `,

  dropdown: {
    title: {
      width: '44px',
      backgroundColor: '#F3F2F1',
      height: '100%',
      lineHeight: '28px',
    },

    dropdown: { height: '100%' },
  },

  nestedDropdown: {
    caretDown: { color: SharedColors.cyanBlue10 },
    caretDownWrapper: { height: '20px', lineHeight: '20px' },
    root: { flexBasis: 'auto', paddingBottom: '-4px' },
    title: {
      border: 'none',
      color: SharedColors.cyanBlue10,
      height: '20px',
      lineHeight: '20px',
    },
  },
};

const onRenderOption = (option?: IDropdownOption): JSX.Element => {
  return (
    <div>
      {option?.data && option?.data?.icon && <span css={styles.icon}> {option?.data?.icon}</span>}
      <span>{option?.text}</span>
    </div>
  );
};

const onRenderTitle = (options: IDropdownOption[] | undefined): JSX.Element => {
  const option = options?.[0];
  const icon = option?.data.icon;

  return (
    <div>
      {icon && <span css={styles.icon}>{icon}</span>}
      <Icon css={{ fontSize: 9, height: 9 }} iconName={'ChevronDown'} title={'ChevronDown'} />
    </div>
  );
};

const OneOfField: React.FC<FieldProps> = (props) => {
  const { definitions, description, id, label, schema, required, uiOptions, value } = props;
  const formUIOptions = useFormConfig();

  const { options, isNested } = useMemo(() => getOptions(schema, definitions), [schema, definitions]);
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

    const { field: Field, customProps } = resolveFieldWidget(
      selectedSchema,
      uiOptions,
      formUIOptions,
      value,
      props.expression
    );
    return (
      <Field
        key={selectedSchema.type}
        expression={expression}
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

  const renderDropDown = () => {
    if (options && options.length > 1) {
      return (
        <Dropdown
          ariaLabel={formatMessage('select property type')}
          data-testid="OneOfFieldType"
          dropdownWidth={-1}
          id={`${props.id}-oneOf`}
          options={options}
          responsiveMode={ResponsiveMode.large}
          selectedKey={selectedKey}
          styles={isNested ? styles.nestedDropdown : styles.dropdown}
          onChange={handleTypeChange}
          onRenderCaretDown={isNested ? undefined : () => null}
          onRenderOption={onRenderOption}
          onRenderTitle={isNested ? undefined : onRenderTitle}
        />
      );
    } else {
      return null;
    }
  };

  const renderFieldLabel = () => {
    return (
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
    );
  };

  return (
    <div css={styles.container}>
      {isNested ? (
        <React.Fragment>
          <div css={styles.label}>
            {renderFieldLabel()}
            {renderDropDown()}
          </div>
          {renderField()}
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div css={styles.label}>{renderFieldLabel()}</div>
          <div style={{ display: 'flex' }}>
            {renderDropDown()}
            <div style={{ flexGrow: 1 }}>{renderField()}</div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export { OneOfField };
