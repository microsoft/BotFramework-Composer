// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import React from 'react';

import { CommonModalityEditorProps, SuggestedActionsStructuredResponseItem } from '../types';

import { ModalityEditorContainer } from './ModalityEditorContainer';
import { StringArrayEditor } from './StringArrayEditor';

type Props = CommonModalityEditorProps & { response: SuggestedActionsStructuredResponseItem };

const SuggestedActionsModalityEditor = React.memo(
  ({
    response,
    lgOption,
    lgTemplates,
    memoryVariables,
    removeModalityDisabled: disableRemoveModality,
    onRemoveModality,
    onUpdateResponseTemplate,
    telemetryClient,
  }: Props) => {
    const [items, setItems] = React.useState<string[]>(response?.value || []);

    const onChange = React.useCallback(
      (newItems: string[]) => {
        setItems(newItems);
        onUpdateResponseTemplate({ SuggestedActions: { kind: 'SuggestedActions', value: newItems } });
      },
      [onUpdateResponseTemplate]
    );

    return (
      <ModalityEditorContainer
        contentDescription="This list of actions will be rendered as suggestions to user."
        contentTitle={formatMessage('Actions')}
        disableRemoveModality={disableRemoveModality}
        modalityTitle={formatMessage('Suggested Actions')}
        modalityType="SuggestedActions"
        removeModalityOptionText={formatMessage('Remove all suggested actions')}
        showRemoveModalityPrompt={!!response?.value.length}
        onRemoveModality={onRemoveModality}
      >
        <StringArrayEditor
          addButtonText={formatMessage('Add suggested action')}
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

export { SuggestedActionsModalityEditor };
