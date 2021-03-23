// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import styled from '@emotion/styled';
import { FieldProps, JSONSchema7, useShellApi } from '@bfc/extension-client';
import { FieldLabel, JsonField, SchemaField, IntellisenseTextField, WithTypeIcons } from '@bfc/adaptive-form';
import Stack from 'office-ui-fabric-react/lib/components/Stack/Stack';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

const IntellisenseTextFieldWithIcon = WithTypeIcons(IntellisenseTextField);

const BorderedStack = styled(Stack)(({ border }: { border: boolean }) =>
  border
    ? {
        borderBottom: `1px solid ${NeutralColors.gray30}`,
      }
    : {}
);

const styles = {
  dropdown: {
    root: {
      ':hover .ms-Dropdown-title, :active .ms-Dropdown-title, :hover .ms-Dropdown-caretDown, :active .ms-Dropdown-caretDown': {
        color: FluentTheme.palette.themeDarker,
      },
      ':focus-within .ms-Dropdown-title, :focus-within .ms-Dropdown-caretDown': {
        color: FluentTheme.palette.accent,
      },
    },
    caretDown: { fontSize: FluentTheme.fonts.xSmall.fontSize, color: FluentTheme.palette.accent },
    dropdownOptionText: { fontSize: FluentTheme.fonts.small.fontSize },
    title: {
      border: 'none',
      fontSize: FluentTheme.fonts.small.fontSize,
      color: FluentTheme.palette.accent,
    },
  },
};

const dropdownCalloutProps = { styles: { root: { minWidth: 140 } } };

const getInitialSelectedKey = (value?: string | Record<string, unknown>, schema?: JSONSchema7): string => {
  if (typeof value !== 'string' && schema) {
    return 'form';
  } else if (typeof value !== 'string' && !schema) {
    return 'code';
  } else {
    return 'expression';
  }
};

const DialogOptionsField: React.FC<FieldProps> = ({
  description,
  uiOptions,
  label,
  required,
  id,
  value = {},
  onChange,
}) => {
  const { dialog, options } = value;
  const { dialogSchemas } = useShellApi();
  const { content: schema }: { content?: JSONSchema7 } = React.useMemo(
    () => dialogSchemas.find(({ id }) => id === dialog) || {},
    [dialog, dialogSchemas]
  );

  const [selectedKey, setSelectedKey] = React.useState<string>(getInitialSelectedKey(options, schema));

  React.useLayoutEffect(() => {
    setSelectedKey(getInitialSelectedKey(options, schema));
  }, [dialog]);

  const change = React.useCallback(
    (newOptions?: string | Record<string, any>) => {
      onChange({ ...value, options: newOptions });
    },
    [value, onChange]
  );

  const onDropdownChange = React.useCallback(
    (_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
      if (option) {
        setSelectedKey(option.key as string);
        if (option.key === 'expression') {
          change();
        }
      }
    },
    [change]
  );

  const typeOptions = React.useMemo<IDropdownOption[]>(() => {
    return [
      {
        key: 'form',
        text: formatMessage('form'),
        disabled: !schema || !Object.keys(schema).length,
      },
      {
        key: 'code',
        text: formatMessage('code editor'),
      },
      {
        key: 'expression',
        text: 'expression',
      },
    ];
  }, [schema]);

  let Field = IntellisenseTextFieldWithIcon;
  if (selectedKey === 'form') {
    Field = SchemaField;
  } else if (selectedKey === 'code') {
    Field = JsonField;
  }

  return (
    <React.Fragment>
      <BorderedStack horizontal border={selectedKey === 'form'} horizontalAlign={'space-between'}>
        <FieldLabel
          description={description}
          helpLink={uiOptions?.helpLink}
          id={id}
          label={label}
          required={required}
        />
        <Dropdown
          ariaLabel={formatMessage('Select property type')}
          calloutProps={dropdownCalloutProps}
          dropdownWidth={-1}
          options={typeOptions}
          selectedKey={selectedKey}
          styles={styles.dropdown}
          onChange={onDropdownChange}
        />
      </BorderedStack>
      <Field
        definitions={schema?.definitions || {}}
        depth={-1}
        id={`${id}.options`}
        label={false}
        name={'options'}
        schema={schema || {}}
        uiOptions={{}}
        value={options || selectedKey === 'expression' ? '' : {}}
        onChange={change}
      />
    </React.Fragment>
  );
};

export { DialogOptionsField };
