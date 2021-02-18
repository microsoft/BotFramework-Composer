// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import React from 'react';

import { useStringArray } from '../hooks/useStringArray';
import { CommonModalityEditorProps, InputHintStructuredResponseItem, SpeechStructuredResponseItem } from '../types';

import { ModalityEditorContainer } from './ModalityEditorContainer';
import { StringArrayEditor } from './StringArrayEditor';

type Props = CommonModalityEditorProps & {
  response: SpeechStructuredResponseItem;
  inputHint?: InputHintStructuredResponseItem['value'] | 'none';
};

const SpeechModalityEditor = React.memo(
  ({
    response,
    removeModalityDisabled: disableRemoveModality,
    lgOption,
    lgTemplates,
    memoryVariables,
    inputHint = 'none',
    onInputHintChange,
    onTemplateChange,
    onRemoveModality,
    onRemoveTemplate,
    onUpdateResponseTemplate,
    telemetryClient,
  }: Props) => {
    const { items, onChange } = useStringArray<SpeechStructuredResponseItem>(
      'Speak',
      response,
      {
        onRemoveTemplate,
        onTemplateChange,
        onUpdateResponseTemplate,
      },
      { lgOption, lgTemplates }
    );

    const inputHintOptions = React.useMemo<IDropdownOption[]>(
      () => [
        {
          key: 'none',
          text: formatMessage('None'),
          selected: inputHint === 'none',
        },
        {
          key: 'accepting',
          text: formatMessage('Accepting'),
          selected: inputHint === 'accepting',
        },
        {
          key: 'ignoring',
          text: formatMessage('Ignoring'),
          selected: inputHint === 'ignoring',
        },
        {
          key: 'expecting',
          text: formatMessage('Expecting'),
          selected: inputHint === 'expecting',
        },
      ],
      [inputHint]
    );

    const inputHintChange = React.useCallback(
      (_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
        if (option) {
          onInputHintChange?.(option.key as string);
        }
      },
      [onInputHintChange]
    );

    return (
      <ModalityEditorContainer
        contentDescription="One of the variations added below will be selected at random by the LG library."
        contentTitle={formatMessage('Response Variations')}
        disableRemoveModality={disableRemoveModality}
        dropdownOptions={inputHintOptions}
        dropdownPrefix={formatMessage('Input hint: ')}
        modalityTitle={formatMessage('Suggested Actions')}
        modalityType="Speak"
        removeModalityOptionText={formatMessage('Remove all speech responses')}
        onDropdownChange={inputHintChange}
        onRemoveModality={onRemoveModality}
      >
        <StringArrayEditor
          isSpeech
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

export { SpeechModalityEditor };
