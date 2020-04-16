// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment } from 'react';
import { SDKKinds, MicrosoftInputDialog, ChoiceInput, ConfirmInput } from '@bfc/shared';
import { FieldLabel, recognizerType, SchemaField, usePluginConfig } from '@bfc/adaptive-form';
import { JSONSchema7, useShellApi } from '@bfc/extension';
import formatMessage from 'format-message';

import { PromptFieldProps } from './types';
import { ChoiceInputSettings } from './ChoiceInputSettings';

const getOptions = (enumSchema: JSONSchema7) => {
  if (!enumSchema || !enumSchema.enum || !Array.isArray(enumSchema.enum)) {
    return [];
  }

  return enumSchema.enum.map((o) => o as string);
};

const UserInput: React.FC<PromptFieldProps<MicrosoftInputDialog>> = (props) => {
  const { onChange, getSchema, value, id, uiOptions, getError, definitions, depth, schema = {} } = props;
  const { currentDialog, designerId } = useShellApi();
  const { recognizers } = usePluginConfig();

  const { const: kind } = (schema?.properties?.['$kind'] as any) || {};
  const [, promptType] = ((kind as string) || '').split('.');
  const intentName = `${promptType}.response-${designerId}`;

  const type = recognizerType(currentDialog);
  const Editor: any = type === SDKKinds.LuisRecognizer && recognizers.find((r) => r.id === type)?.editor;
  const intentLabel = formatMessage('Expected responses (intent: #{intentName})', { intentName });

  return (
    <Fragment>
      <SchemaField
        definitions={definitions}
        depth={depth}
        id={`${id}.property`}
        name="property"
        onChange={onChange('property')}
        rawErrors={getError('property')}
        schema={getSchema('property')}
        uiOptions={uiOptions.properties?.property || {}}
        value={value?.property}
      />
      {getSchema('outputFormat') && (
        <SchemaField
          definitions={definitions}
          depth={depth}
          id={`${id}.outputFormat`}
          name="outputFormat"
          onChange={onChange('outputFormat')}
          rawErrors={getError('outputFormat')}
          schema={getSchema('outputFormat')}
          uiOptions={uiOptions.properties?.outputFormat || {}}
          value={value?.outputFormat}
        />
      )}
      <SchemaField
        definitions={definitions}
        depth={depth}
        id={`${id}.value`}
        name="value"
        onChange={onChange('value')}
        rawErrors={getError('value')}
        schema={getSchema('value')}
        uiOptions={uiOptions.properties?.value || {}}
        value={value?.value}
      />
      {Editor && kind !== SDKKinds.AttachmentInput && (
        <React.Fragment>
          <FieldLabel id={`${id}.intent`} label={intentLabel} />
          <Editor {...props} onChange={() => {}} />
        </React.Fragment>
      )}
      {getSchema('defaultLocale') && (
        <SchemaField
          definitions={definitions}
          depth={depth}
          id={`${id}.defaultLocale`}
          name="defaultLocale"
          onChange={onChange('defaultLocale')}
          rawErrors={getError('defaultLocale')}
          schema={getSchema('defaultLocale')}
          uiOptions={uiOptions.properties?.defaultLocale || {}}
          value={((value as unknown) as ChoiceInput).defaultLocale}
        />
      )}
      {getSchema('style') && (
        <SchemaField
          definitions={definitions}
          depth={depth}
          enumOptions={getOptions(getSchema('style'))}
          id={`${id}.style`}
          name="style"
          onChange={onChange('style')}
          rawErrors={getError('style')}
          schema={getSchema('style')}
          uiOptions={uiOptions.properties?.style || {}}
          value={((value as unknown) as ChoiceInput).style}
        />
      )}
      {value?.$kind === SDKKinds.ChoiceInput && (
        <ChoiceInputSettings {...props} choiceProperty="choices" value={(value as unknown) as ChoiceInput} />
      )}
      {value?.$kind === SDKKinds.ConfirmInput && (
        <ChoiceInputSettings {...props} choiceProperty="confirmChoices" value={(value as unknown) as ConfirmInput} />
      )}
    </Fragment>
  );
};

export { UserInput };
