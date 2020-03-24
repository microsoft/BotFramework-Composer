// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment } from 'react';
import { SDKTypes, MicrosoftInputDialog, ChoiceInput, ConfirmInput } from '@bfc/shared';
import { FieldLabel, recognizerType, SchemaField, usePluginConfig } from '@bfc/adaptive-form';
import { JSONSchema7, useShellApi } from '@bfc/extension';
import formatMessage from 'format-message';

import { PromptFieldProps } from './types';
import { ChoiceInputSettings } from './ChoiceInputSettings';

const getOptions = (enumSchema: JSONSchema7) => {
  if (!enumSchema || !enumSchema.enum || !Array.isArray(enumSchema.enum)) {
    return [];
  }

  return enumSchema.enum.map(o => o as string);
};

const UserInput: React.FC<PromptFieldProps<MicrosoftInputDialog>> = props => {
  const { onChange, getSchema, value, id, uiOptions, getError, definitions, depth, schema = {} } = props;
  const { currentDialog, designerId } = useShellApi();
  const { recognizers } = usePluginConfig();

  const { const: kind } = (schema?.properties?.['$kind'] as any) || {};
  const [, promptType] = ((kind as string) || '').split('.');
  const intentName = `${promptType}.response-${designerId}`;

  const type = recognizerType(currentDialog);
  const Editor: any = type === SDKTypes.LuisRecognizer && recognizers.find(r => r.id === type)?.editor;
  const intentLabel = formatMessage('Expected responses (intent: #{intentName})', { intentName });

  return (
    <Fragment>
      <SchemaField
        name="property"
        definitions={definitions}
        depth={depth}
        id={`${id}.property`}
        schema={getSchema('property')}
        uiOptions={uiOptions.properties?.property || {}}
        value={value?.property}
        onChange={onChange('property')}
        rawErrors={getError('property')}
      />
      {getSchema('outputFormat') && (
        <SchemaField
          name="outputFormat"
          definitions={definitions}
          depth={depth}
          id={`${id}.outputFormat`}
          schema={getSchema('outputFormat')}
          uiOptions={uiOptions.properties?.outputFormat || {}}
          value={value?.outputFormat}
          onChange={onChange('outputFormat')}
          rawErrors={getError('outputFormat')}
        />
      )}
      <SchemaField
        name="value"
        definitions={definitions}
        depth={depth}
        id={`${id}.value`}
        schema={getSchema('value')}
        uiOptions={uiOptions.properties?.value || {}}
        value={value?.value}
        onChange={onChange('value')}
        rawErrors={getError('value')}
      />
      {Editor && kind !== SDKTypes.AttachmentInput && (
        <React.Fragment>
          <FieldLabel id={`${id}.intent`} label={intentLabel} />
          <Editor {...props} onChange={() => {}} />
        </React.Fragment>
      )}
      {getSchema('defaultLocale') && (
        <SchemaField
          name="defaultLocale"
          definitions={definitions}
          depth={depth}
          id={`${id}.defaultLocale`}
          schema={getSchema('defaultLocale')}
          uiOptions={uiOptions.properties?.defaultLocale || {}}
          value={((value as unknown) as ChoiceInput).defaultLocale}
          onChange={onChange('defaultLocale')}
          rawErrors={getError('defaultLocale')}
        />
      )}
      {getSchema('style') && (
        <SchemaField
          name="style"
          definitions={definitions}
          depth={depth}
          enumOptions={getOptions(getSchema('style'))}
          id={`${id}.style`}
          schema={getSchema('style')}
          uiOptions={uiOptions.properties?.style || {}}
          value={((value as unknown) as ChoiceInput).style}
          onChange={onChange('style')}
          rawErrors={getError('style')}
        />
      )}
      {value?.$type === SDKTypes.ChoiceInput && (
        <ChoiceInputSettings {...props} value={(value as unknown) as ChoiceInput} choiceProperty="choices" />
      )}
      {value?.$type === SDKTypes.ConfirmInput && (
        <ChoiceInputSettings {...props} value={(value as unknown) as ConfirmInput} choiceProperty="confirmChoices" />
      )}
    </Fragment>
  );
};

export { UserInput };
