// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import styled from '@emotion/styled';
import { FieldProps, JSONSchema7, useShellApi } from '@bfc/extension-client';
import { FieldLabel, IntellisenseTextField, OpenObjectField, WithTypeIcons, SchemaField } from '@bfc/adaptive-form';
import Stack from 'office-ui-fabric-react/lib/components/Stack/Stack';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import Ajv, { AnySchemaObject } from 'ajv';

const loadSchema = async (uri: string) => {
  const res = await fetch(uri);
  return res.body as AnySchemaObject;
};

const ajv = new Ajv({
  loadSchema,
  strict: false,
});

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

const getSelectedKey = (
  value?: string | Record<string, unknown>,
  schema?: JSONSchema7,
  validSchema = false
): string => {
  if (typeof value !== 'string' && schema && validSchema) {
    return 'form';
  } else if (typeof value !== 'string' && (!schema || !validSchema)) {
    return 'object';
  } else {
    return 'expression';
  }
};

type JSONValidationStatus = 'valid' | 'inValid' | 'validating';

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

  const [selectedKey, setSelectedKey] = React.useState<string>();
  const [validationStatus, setValidationStatus] = React.useState<JSONValidationStatus>('validating');

  const mountRef = React.useRef(false);

  React.useEffect(() => {
    mountRef.current = true;
    if (schema && Object.keys(schema.properties || {}).length) {
      (async () => {
        setValidationStatus('validating');
        try {
          const validate = await ajv.compileAsync(schema, true);
          const valid = validate(schema);

          if (mountRef.current) {
            setValidationStatus(valid ? 'valid' : 'inValid');
            setSelectedKey(getSelectedKey(options, schema, true));
          }
        } catch (error) {
          if (mountRef.current) {
            setValidationStatus('inValid');
            setSelectedKey(getSelectedKey(options, schema, false));
          }
        }
      })();
    } else {
      setSelectedKey(getSelectedKey(options, schema, false));
    }

    return () => {
      mountRef.current = false;
    };
  }, [schema]);

  const change = React.useCallback(
    (newOptions?: string | Record<string, any>) => {
      onChange({ ...value, options: newOptions });
    },
    [value, onChange]
  );

  const onDropdownChange = React.useCallback(
    (_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
      if (option) {
        // When the user switched between data types - either a string (expression) or an object (form or object) - we need to set
        // options to undefined so we don't incorrectly pass a string to an object editor or pass an object to a string editor.

        // If selectedKey is currently set to expression and the user is switching to form or object, set the value to undefined.
        // If the user is switching to expression meaning the selectedKey is currently set to form or form, set the value to undefined.
        if (option.key === 'expression' || selectedKey === 'expression') {
          change();
        }
        setSelectedKey(option.key as string);
      }
    },
    [change, selectedKey]
  );

  const typeOptions = React.useMemo<IDropdownOption[]>(() => {
    return [
      {
        key: 'form',
        text: formatMessage('form'),
        disabled: !schema || validationStatus !== 'valid',
      },
      {
        key: 'object',
        text: formatMessage('object'),
      },
      {
        key: 'expression',
        text: 'expression',
      },
    ];
  }, [schema, validationStatus]);

  let Field = IntellisenseTextFieldWithIcon;
  if (selectedKey === 'form') {
    Field = SchemaField;
  } else if (selectedKey === 'object') {
    Field = OpenObjectField;
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
        schema={(selectedKey === 'form' ? schema : { type: 'object', additionalProperties: true }) || {}}
        uiOptions={{}}
        value={options}
        onChange={change}
      />
    </React.Fragment>
  );
};

export { DialogOptionsField };
