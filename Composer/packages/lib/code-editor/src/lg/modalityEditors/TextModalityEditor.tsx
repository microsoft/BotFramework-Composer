// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import React from 'react';

import { useStringArray } from '../hooks/useStringArray';
import { CommonModalityEditorProps, TextStructuredResponseItem } from '../types';

import { ModalityEditorContainer } from './ModalityEditorContainer';
import { StringArrayEditor } from './StringArrayEditor';

type Props = CommonModalityEditorProps & { response: TextStructuredResponseItem };

const TextModalityEditor = React.memo(
  ({
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
  }: Props) => {
    const { items, onChange } = useStringArray<TextStructuredResponseItem>(
      'Text',
      response,
      {
        onRemoveTemplate,
        onTemplateChange,
        onUpdateResponseTemplate,
      },
      { lgOption, lgTemplates }
    );

    return (
      <ModalityEditorContainer
        contentDescription={formatMessage(
          'One of the variations added below will be selected at random by the LG library.'
        )}
        contentTitle={formatMessage('Response Variations')}
        disableRemoveModality={disableRemoveModality}
        modalityTitle={formatMessage('Text')}
        modalityType="Text"
        removeModalityOptionText={formatMessage('Remove all text responses')}
        onRemoveModality={onRemoveModality}
      >
        <StringArrayEditor
          items={items}
          lgOption={lgOption}
          lgTemplates={lgTemplates}
          memoryVariables={memoryVariables}
          telemetryClient={telemetryClient}
          onChange={onChange}
        />
      </ModalityEditorContainer>
    );
  }
);

export { TextModalityEditor };
