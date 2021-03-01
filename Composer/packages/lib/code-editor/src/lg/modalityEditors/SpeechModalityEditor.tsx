// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { IDropdownOption, DropdownMenuItemType } from 'office-ui-fabric-react/lib/Dropdown';
import React from 'react';

import { useStringArray } from '../hooks/useStringArray';
import { CommonModalityEditorProps, InputHintStructuredResponseItem, SpeechStructuredResponseItem } from '../types';

import { ModalityEditorContainer } from './ModalityEditorContainer';
import { StringArrayEditor } from './StringArrayEditor';

const inputHintDocumentUrl =
  'https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-connector-add-input-hints?view=azure-bot-service-4.0';

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
    inputHint = 'acceptingInput',
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
          key: 'header',
          text: formatMessage('Input hint'),
          itemType: DropdownMenuItemType.Header,
          data: {
            tooltipId: 'input-hint-dropdown-header',
            tooltipText: formatMessage.rich('To learn more, <a>visit this document</a>.', {
              a: ({ children }) => (
                <Link key="input-hint-dropdown-header-link" href={inputHintDocumentUrl} target="_blank">
                  {children}
                </Link>
              ),
            }),
          },
        },

        {
          key: 'acceptingInput',
          text: formatMessage('Accepting'),
          selected: inputHint === 'acceptingInput',
        },
        {
          key: 'ignoringInput',
          text: formatMessage('Ignoring'),
          selected: inputHint === 'ignoringInput',
        },
        {
          key: 'expectingInput',
          text: formatMessage('Expecting'),
          selected: inputHint === 'expectingInput',
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
        modalityTitle={formatMessage('Speech')}
        modalityType="Speak"
        removeModalityOptionText={formatMessage('Remove all speech responses')}
        showRemoveModalityPrompt={!!response?.value.length}
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
