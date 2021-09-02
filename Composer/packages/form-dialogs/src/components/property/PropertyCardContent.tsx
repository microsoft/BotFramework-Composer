/* eslint-disable @typescript-eslint/no-explicit-any */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FormDialogSchemaTemplate } from '@bfc/shared';
import { ComboBox } from 'office-ui-fabric-react/lib/ComboBox';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import * as React from 'react';
import { useRecoilValue } from 'recoil';

import { formDialogLocale } from '../../atoms/appState';
import { FieldLabel } from '../common/FieldLabel';
import { ValuePicker } from '../common/ValuePicker';

import { EnumExampleContent } from './examples/EnumExampleContent';
import { StringExampleContent } from './examples/StringExampleContent';

const metaKeys = ['$comment'];

const templateInfoKeysFilter = (key: string) => !metaKeys.includes(key);

type Props = {
  propertyName: string;
  template: FormDialogSchemaTemplate;
  cardValues: Record<string, any>;
  onDataChange: (data: Record<string, any>) => void;
};

const renderField = (variable: string, info: Record<string, any>, value: any, onChange: (value: any) => void) => {
  const renderLabel = (helpText: string, tooltipId: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: any, defaultRender?: (props: any) => JSX.Element | null) => (
      <FieldLabel defaultRender={defaultRender(props)} helpText={helpText} tooltipId={tooltipId} />
    );

  const convertValue = (value: string) => {
    switch (info.type) {
      case 'integer':
        return parseInt(value, 10);
      case 'number':
        return parseFloat(value);
      default:
        return value;
    }
  };

  const getTextFieldCustomProps = () => {
    const defaultProps = { type: info.type ?? 'text' };
    switch (info.type) {
      case 'integer':
        return { ...defaultProps, step: '1' };
      case 'number':
        return { ...defaultProps, step: 'any' };
      default:
        return defaultProps;
    }
  };

  switch (info.type) {
    case 'array':
      return (
        <ValuePicker
          label={info.title}
          values={value || []}
          onChange={onChange}
          onRenderLabel={renderLabel(info.description, variable)}
        />
      );
    case 'string': {
      const hasEnum = !!info.enum;

      return hasEnum ? (
        <ComboBox
          allowFreeform
          autoComplete="off"
          label={info.title}
          options={info.enum.map((v) => ({ key: v, text: v }))}
          selectedKey={value}
          styles={{ root: { maxWidth: 320 }, optionsContainer: { maxHeight: 320 } }}
          onChange={(_, option) => onChange(option.key)}
          onRenderLabel={renderLabel(info.description, variable)}
        />
      ) : (
        <TextField
          autoComplete="off"
          label={info.title}
          type={info.type ?? 'text'}
          value={value}
          onChange={(_, newValue) => onChange(newValue)}
          onRenderLabel={renderLabel(info.description, variable)}
        />
      );
    }
    default:
      return (
        <TextField
          autoComplete="off"
          label={info.title}
          {...getTextFieldCustomProps()}
          value={value}
          onChange={(_, newValue) => onChange(convertValue(newValue))}
          onRenderLabel={renderLabel(info.description, variable)}
        />
      );
  }
};

export const PropertyCardContent = (props: Props) => {
  const { propertyName, template, cardValues, onDataChange } = props;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { title, description, array, $examples, ...templateInfo } = template.$generator;
  const locale = useRecoilValue(formDialogLocale);

  const formFieldChange = (variable: string) => (value: any) => {
    const newFormData = { ...cardValues, [variable]: value };
    onDataChange(newFormData);
  };

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      {Object.keys(templateInfo)
        .filter(templateInfoKeysFilter)
        .map((variable) => (
          <Stack key={variable} verticalAlign="center">
            {renderField(variable, templateInfo[variable], cardValues[variable], formFieldChange(variable))}
          </Stack>
        ))}
      {$examples && template.id === 'enum' && (
        <EnumExampleContent
          $examples={$examples}
          enums={(cardValues.enum ?? []) as string[]}
          exampleData={cardValues.$examples ?? {}}
          locale={locale}
          propertyName={propertyName}
          onChange={formFieldChange('$examples')}
        />
      )}
      {$examples && template.id === 'string' && (
        <StringExampleContent
          $examples={$examples}
          exampleData={cardValues.$examples ?? {}}
          locale={locale}
          propertyType={template.id}
          onChange={formFieldChange('$examples')}
        />
      )}
    </Stack>
  );
};
