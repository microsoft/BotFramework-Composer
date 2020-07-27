// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment } from 'react';
import { SDKKinds, MicrosoftInputDialog, ChoiceInput, ConfirmInput, LuMetaData, LuType } from '@bfc/shared';
import { FieldLabel, SchemaField } from '@bfc/adaptive-form';
import { JSONSchema7, useShellApi, useRecognizerConfig } from '@bfc/extension';
import formatMessage from 'format-message';

import { PromptFieldProps } from './types';
import { ChoiceInputSettings } from './ChoiceInputSettings';

const getOptions = (enumSchema: JSONSchema7) => {
  if (!enumSchema || !enumSchema.enum || !Array.isArray(enumSchema.enum)) {
    return [];
  }

  return enumSchema.enum.map((o) => o as string);
};

const expectedResponsesPlaceholder = () =>
  formatMessage(`> add some expected user responses:
> - Please remind me to '{itemTitle=buy milk}'
> - remind me to '{itemTitle}'
> - add '{itemTitle}' to my todo list
>
> entity definitions:
> @ ml itemTitle
`);

const UserInput: React.FC<PromptFieldProps<MicrosoftInputDialog>> = (props) => {
  const { onChange, getSchema, value, id, uiOptions, getError, definitions, depth, schema = {} } = props;
  const { currentDialog, designerId } = useShellApi();
  const recognizers = useRecognizerConfig();

  const { const: $kind } = (schema?.properties?.$kind as { const: string }) || {};
  const intentName = new LuMetaData(new LuType($kind).toString(), designerId).toString();

  const recognizer = recognizers.find((r) => r.isSelected(currentDialog?.content?.recognizer));
  const Editor = recognizer?.id === SDKKinds.LuisRecognizer && recognizer?.editor;
  const intentLabel = formatMessage('Expected responses (intent: #{intentName})', { intentName });

  return (
    <Fragment>
      <SchemaField
        definitions={definitions}
        depth={depth}
        id={`${id}.property`}
        name="property"
        rawErrors={getError('property')}
        schema={getSchema('property')}
        uiOptions={uiOptions.properties?.property || {}}
        value={value?.property}
        onChange={onChange('property')}
      />
      {getSchema('outputFormat') && (
        <SchemaField
          definitions={definitions}
          depth={depth}
          id={`${id}.outputFormat`}
          name="outputFormat"
          rawErrors={getError('outputFormat')}
          schema={getSchema('outputFormat')}
          uiOptions={uiOptions.properties?.outputFormat || {}}
          value={value?.outputFormat}
          onChange={onChange('outputFormat')}
        />
      )}
      <SchemaField
        definitions={definitions}
        depth={depth}
        id={`${id}.value`}
        name="value"
        rawErrors={getError('value')}
        schema={getSchema('value')}
        uiOptions={uiOptions.properties?.value || {}}
        value={value?.value}
        onChange={onChange('value')}
      />
      {Editor && $kind !== SDKKinds.AttachmentInput && (
        <React.Fragment>
          <FieldLabel id={`${id}.intent`} label={intentLabel} />
          <Editor {...props} placeholder={expectedResponsesPlaceholder()} onChange={() => {}} />
        </React.Fragment>
      )}
      {getSchema('defaultLocale') && (
        <SchemaField
          definitions={definitions}
          depth={depth}
          id={`${id}.defaultLocale`}
          name="defaultLocale"
          rawErrors={getError('defaultLocale')}
          schema={getSchema('defaultLocale')}
          uiOptions={uiOptions.properties?.defaultLocale || {}}
          value={((value as unknown) as ChoiceInput).defaultLocale}
          onChange={onChange('defaultLocale')}
        />
      )}
      {getSchema('style') && (
        <SchemaField
          definitions={definitions}
          depth={depth}
          enumOptions={getOptions(getSchema('style'))}
          id={`${id}.style`}
          name="style"
          rawErrors={getError('style')}
          schema={getSchema('style')}
          uiOptions={uiOptions.properties?.style || {}}
          value={((value as unknown) as ChoiceInput).style}
          onChange={onChange('style')}
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
