// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import React from 'react';

import { useStringArray } from '../hooks/useStringArray';
import { CommonModalityEditorProps, TextStructuredResponseItem } from '../types';

import { ModalityEditorContainer } from './ModalityEditorContainer';
import { StringArrayEditor } from './StringArrayEditor';

type Props = CommonModalityEditorProps & {
  focusOnMount: boolean;
  response: TextStructuredResponseItem;
  startWithEmptyResponse?: boolean;
};

const TextModalityEditor = React.memo(
  ({
    focusOnMount,
    response,
    removeModalityDisabled: disableRemoveModality,
    lgOption,
    lgTemplates,
    memoryVariables,
    onTemplateChange,
    onRemoveModality,
    onRemoveTemplate,
    onUpdateResponseTemplate,
    telemetryClient,
    startWithEmptyResponse,
  }: Props) => {
    const { items, onChange } = useStringArray<TextStructuredResponseItem>(
      'Text',
      response,
      {
        onRemoveTemplate,
        onTemplateChange,
        onUpdateResponseTemplate,
      },
      { lgOption, lgTemplates, focusOnMount }
    );

    return (
      <ModalityEditorContainer
        contentDescription={formatMessage(
          'Response alternatives will be selected at random for a more dynamic conversation.'
        )}
        contentTitle={formatMessage('Responses')}
        disableRemoveModality={disableRemoveModality}
        modalityTitle={formatMessage('Text')}
        modalityType="Text"
        removeModalityOptionText={formatMessage('Remove all text responses')}
        showRemoveModalityPrompt={!!response?.value.length}
        onRemoveModality={onRemoveModality}
      >
        <StringArrayEditor
          editorMode="rich"
          items={items}
          lgOption={lgOption}
          lgTemplates={lgTemplates}
          memoryVariables={memoryVariables}
          startWithEmptyResponse={startWithEmptyResponse}
          telemetryClient={telemetryClient}
          onChange={onChange}
        />
      </ModalityEditorContainer>
    );
  }
);

export { TextModalityEditor };
