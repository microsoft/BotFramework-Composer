// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FieldLabel, useAdaptiveFormContext } from '@bfc/adaptive-form';
import { FieldProps, useRecognizerConfig, useShellApi } from '@bfc/extension-client';
import formatMessage from 'format-message';
import { LuMetaData, LuType } from '@bfc/shared';

const expectedResponsesPlaceholder = () =>
  formatMessage(`> add some expected user responses:
> - Please remind me to '{itemTitle=buy milk}'
> - remind me to '{itemTitle}'
> - add '{itemTitle}' to my todo list
>
> entity definitions:
> @ ml itemTitle
`);

const ExpectedResponsesField: React.FC<FieldProps> = (props) => {
  const { id, description } = props;
  const { designerId } = useShellApi();
  const { currentRecognizer } = useRecognizerConfig();
  const { baseSchema: schema } = useAdaptiveFormContext();

  const { const: $kind } = schema?.properties?.$kind as { const: string };

  const intentName = new LuMetaData(new LuType($kind).toString(), designerId).toString();
  const label = formatMessage('Expected responses (intent: #{intentName})', { intentName });

  const Editor = currentRecognizer?.intentEditor;

  return Editor ? (
    <React.Fragment>
      <FieldLabel description={description} id={id} label={label} />
      <Editor
        {...props}
        placeholder={expectedResponsesPlaceholder()}
        schema={schema}
        value={intentName}
        onChange={() => {}}
      />
    </React.Fragment>
  ) : null;
};

export { ExpectedResponsesField };
