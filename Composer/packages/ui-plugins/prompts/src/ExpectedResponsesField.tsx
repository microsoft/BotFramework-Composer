// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FieldLabel, useAdaptiveFormContext } from '@bfc/adaptive-form';
import { FieldProps, SDKKinds, useRecognizerConfig, useShellApi } from '@bfc/extension-client';
import formatMessage from 'format-message';
import { LuMetaData, LuType } from '@bfc/shared';

const expectedResponsesPlaceholder = (id?: SDKKinds) => {
  let placehold = '';
  switch (id) {
    case SDKKinds.CrossTrainedRecognizerSet:
    case SDKKinds.LuisRecognizer:
      placehold = formatMessage(`> add some expected user responses:
      > - Please remind me to '{itemTitle=buy milk}'
      > - remind me to '{itemTitle}'
      > - add '{itemTitle}' to my todo list
      >
      > entity definitions:
      > @ ml itemTitle
      `);
      break;
    case SDKKinds.RegexRecognizer:
      placehold = formatMessage('Add some regex patterns');
      break;
    default:
      break;
  }
  return placehold;
};

const ExpectedResponsesField: React.FC<FieldProps> = (props) => {
  const { id, description } = props;
  const { designerId } = useShellApi();
  const { currentRecognizer } = useRecognizerConfig();
  const { baseSchema: schema } = useAdaptiveFormContext();

  const { const: $kind } = schema?.properties?.$kind as { const: string };

  const intentName = new LuMetaData(new LuType($kind).toString(), designerId).toString();
  const label = formatMessage('Expected responses');

  const Editor = currentRecognizer?.intentEditor;

  return Editor ? (
    <React.Fragment>
      <FieldLabel description={description} id={id} label={label} />
      <Editor
        {...props}
        label={label}
        placeholder={expectedResponsesPlaceholder(currentRecognizer?.id as SDKKinds)}
        schema={schema}
        value={intentName}
        onChange={() => {}}
      />
    </React.Fragment>
  ) : null;
};

export { ExpectedResponsesField };
