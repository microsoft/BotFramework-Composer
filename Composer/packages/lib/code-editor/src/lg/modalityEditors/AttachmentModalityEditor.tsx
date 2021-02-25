// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import React from 'react';
import { IDropdownOption, DropdownMenuItemType } from 'office-ui-fabric-react/lib/Dropdown';
import { CodeEditorSettings } from '@bfc/shared';

import {
  AttachmentsStructuredResponseItem,
  AttachmentLayoutStructuredResponseItem,
  CommonModalityEditorProps,
} from '../types';
import { extractTemplateNameFromExpression } from '../../utils/structuredResponse';

import { ModalityEditorContainer } from './ModalityEditorContainer';
import { AttachmentArrayEditor } from './AttachmentArrayEditor';

type Props = CommonModalityEditorProps & {
  response: AttachmentsStructuredResponseItem;
  attachmentLayout?: AttachmentLayoutStructuredResponseItem['value'];
  editorSettings?: Partial<CodeEditorSettings>;
};

const AttachmentModalityEditor = React.memo(
  ({
    response,
    lgOption,
    lgTemplates,
    memoryVariables,
    removeModalityDisabled: disableRemoveModality,
    attachmentLayout = 'list',
    onAttachmentLayoutChange,
    onUpdateResponseTemplate,
    onRemoveModality,
    onTemplateChange,
    telemetryClient,
    editorSettings,
  }: Props) => {
    const [items, setItems] = React.useState<string[]>(
      response?.value.map((item) => extractTemplateNameFromExpression(item) || '').filter(Boolean) || []
    );

    const handleChange = React.useCallback(
      (newItems: string[]) => {
        setItems(newItems);
        onUpdateResponseTemplate({
          Attachments: { kind: 'Attachments', value: newItems.map((item) => `\${${item}()}`), valueType: 'direct' },
        });
      },
      [setItems, onUpdateResponseTemplate]
    );

    const attachmentLayoutOptions = React.useMemo<IDropdownOption[]>(
      () => [
        {
          key: 'header',
          text: formatMessage('Attachment layout'),
          itemType: DropdownMenuItemType.Header,
          data: {
            tooltipId: 'attachment-layout-dropdown-header',
            tooltipText: formatMessage('Specify an attachment layout when there are more than one.'),
          },
        },
        {
          key: 'list',
          text: formatMessage('List'),
          selected: attachmentLayout === 'list',
        },
        {
          key: 'carousal',
          text: formatMessage('Carousal'),
          selected: attachmentLayout === 'carousel',
        },
      ],
      [attachmentLayout]
    );

    const attachmentLayoutChange = React.useCallback(
      (_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
        if (option) {
          onAttachmentLayoutChange?.(option.key as string);
        }
      },
      [onAttachmentLayoutChange]
    );

    return (
      <ModalityEditorContainer
        contentDescription="List of attachments to send to users. Multiple attachments will be displayed simultaneously."
        contentTitle={formatMessage('Attachments')}
        disableRemoveModality={disableRemoveModality}
        dropdownOptions={attachmentLayoutOptions}
        dropdownPrefix={formatMessage('Layout: ')}
        modalityTitle={formatMessage('Attachments')}
        modalityType="Attachments"
        removeModalityOptionText={formatMessage('Remove all attachments')}
        showRemoveModalityPrompt={!!response?.value.length}
        onDropdownChange={attachmentLayoutChange}
        onRemoveModality={onRemoveModality}
      >
        <AttachmentArrayEditor
          codeEditorSettings={editorSettings}
          items={items}
          lgOption={lgOption}
          lgTemplates={lgTemplates}
          memoryVariables={memoryVariables}
          selectedKey="text"
          telemetryClient={telemetryClient}
          onChange={handleChange}
          onTemplateChange={onTemplateChange}
        />
      </ModalityEditorContainer>
    );
  }
);

export { AttachmentModalityEditor };
