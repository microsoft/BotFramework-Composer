// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { JsonEditor } from '@bfc/code-editor';
import { FieldProps, useFormConfig, useShellApi } from '@bfc/extension-client';
import { Intellisense } from '@bfc/intellisense';
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import React, { useEffect, useMemo, useState } from 'react';

import { getUiPlaceholder, resolveFieldWidget } from '../../../utils';
import { getIntellisenseUrl } from '../../../utils/getIntellisenseUrl';
import { ExpressionSwitchWindow } from '../../ExpressionSwitchWindow';
import { FieldLabel } from '../../FieldLabel';
import { ExpressionEditor } from '../ExpressionField/ExpressionEditor';
import { oneOfField } from '../styles';

import { getOptions, getSelectedOption } from './utils';

const OneOfField: React.FC<FieldProps> = (props) => {
  const { definitions, description, id, label, schema, required, uiOptions, value } = props;
  const formUIOptions = useFormConfig();
  const editorRef = React.useRef<any>();
  const options = useMemo(() => getOptions(schema, definitions), [schema, definitions]);
  const initialSelectedOption = useMemo(
    () => getSelectedOption(value, options) || ({ key: '', data: { schema: undefined } } as IDropdownOption),
    []
  );

  const [focused, setFocused] = useState(false);

  const { userSettings } = useShellApi();

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

  const editorDidMount = (_, editor: any) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    if (editorRef.current) {
      const onFocusListener = editorRef.current.onDidFocusEditorWidget(() => {
        setFocused(true);
      });

      const onBlurListener = editorRef.current.onDidBlurEditorWidget(() => {
        setFocused(false);
      });

      return () => {
        onFocusListener.dispose();
        onBlurListener.dispose();
      };
    }
  }, [editorRef.current]);

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
        <Intellisense
          completionListOverrideResolver={(value: any) => {
            if (value === {}) {
              return (
                <ExpressionSwitchWindow
                  type="Object"
                  onSwitchToExpression={() => {
                    props.onChange('=');
                  }}
                />
              );
            } else if (value === []) {
              return (
                <ExpressionSwitchWindow
                  type="Object"
                  onSwitchToExpression={() => {
                    props.onChange('=');
                  }}
                />
              );
            } else return null;
          }}
          focused={focused}
          id={`intellisense-${id}`}
          scopes={['expressions']}
          url={getIntellisenseUrl()}
          value={value}
          onChange={props.onChange}
        >
          {({ textFieldValue, onValueChanged }) => (
            <JsonEditor
              key={selectedSchema.type}
              editorDidMount={editorDidMount}
              editorSettings={userSettings.codeEditor}
              height={100}
              id={props.id}
              schema={selectedSchema}
              value={textFieldValue || defaultValue}
              onChange={onValueChanged}
            />
          )}
        </Intellisense>
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
