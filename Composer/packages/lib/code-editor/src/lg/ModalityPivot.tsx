// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CodeEditorSettings, LgTemplate, TelemetryClient } from '@bfc/shared';
import { FluentTheme, FontSizes } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import {
  ContextualMenuItemType,
  IContextualMenuItem,
  IContextualMenuItemProps,
  IContextualMenuItemRenderFunctions,
  IContextualMenuProps,
} from 'office-ui-fabric-react/lib/ContextualMenu';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { IPivotStyles, Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import mergeWith from 'lodash/mergeWith';

import { LGOption } from '../utils';
import { ItemWithTooltip } from '../components/ItemWithTooltip';
import {
  extractTemplateNameFromExpression,
  getTemplateId,
  structuredResponseToString,
} from '../utils/structuredResponse';

import { AttachmentModalityEditor } from './modalityEditors/AttachmentModalityEditor';
import { SpeechModalityEditor } from './modalityEditors/SpeechModalityEditor';
import { SuggestedActionsModalityEditor } from './modalityEditors/SuggestedActionsModalityEditor';
import { TextModalityEditor } from './modalityEditors/TextModalityEditor';
import {
  AttachmentsStructuredResponseItem,
  SpeechStructuredResponseItem,
  SuggestedActionsStructuredResponseItem,
  TextStructuredResponseItem,
  ModalityType,
  PartialStructuredResponse,
  AttachmentLayoutStructuredResponseItem,
  InputHintStructuredResponseItem,
  modalityTypes,
  ArrayBasedStructuredResponseItem,
} from './types';

const menuItemStyle = { fontSize: FluentTheme.fonts.small.fontSize };

const arrayBasedStructuredResponses: ModalityType[] = ['Text', 'Speak'];

const modalityDocumentUrl =
  'https://docs.microsoft.com/en-us/azure/bot-service/language-generation/language-generation-structured-response-template?view=azure-bot-service-4.0';

const getModalityTooltipText = (modality: ModalityType) => {
  switch (modality) {
    case 'Attachments':
      return formatMessage(
        'List of attachments with their type. Used by channels to render as UI cards or other generic file attachment types.'
      );
    case 'Speak':
      return formatMessage('Spoken text used by the channel to render audibly.');
    case 'SuggestedActions':
      return formatMessage('List of actions rendered as suggestions to user.');
    case 'Text':
      return formatMessage('Display text used by the channel to render visually.');
  }
};

const addButtonIconProps = { iconName: 'Add', styles: { root: { fontSize: FontSizes.size14 } } };

const styles: { tabs: Partial<IPivotStyles> } = {
  tabs: {
    link: {
      fontSize: FontSizes.size12,
    },
    linkIsSelected: {
      fontSize: FontSizes.size12,
    },
  },
};

/**
 * Renders appropriate modality editor given the modality type.
 */
const renderModalityEditor = ({
  modality,
  removeModalityDisabled,
  structuredResponse,
  lgOption,
  lgTemplates,
  memoryVariables,
  telemetryClient,
  editorSettings,
  onRemoveModality,
  onTemplateChange,
  onAttachmentLayoutChange,
  onInputHintChange,
  onUpdateResponseTemplate,
  onRemoveTemplate,
}: {
  modality: string;
  removeModalityDisabled: boolean;
  structuredResponse?: PartialStructuredResponse;
  lgOption?: LGOption;
  lgTemplates?: readonly LgTemplate[];
  memoryVariables?: readonly string[];
  telemetryClient: TelemetryClient;
  editorSettings?: Partial<CodeEditorSettings>;
  onRemoveModality: (modality: ModalityType) => void;
  onTemplateChange: (templateId: string, body?: string) => void;
  onAttachmentLayoutChange: (layout: string) => void;
  onInputHintChange: (inputHintString: string) => void;
  onUpdateResponseTemplate: (response: PartialStructuredResponse) => void;
  onRemoveTemplate: (templateId: string) => void;
}) => {
  const commonProps = {
    lgOption,
    lgTemplates,
    memoryVariables,
    removeModalityDisabled,
    telemetryClient,
    onTemplateChange,
    onUpdateResponseTemplate,
    onRemoveModality,
    onRemoveTemplate,
  };

  switch (modality) {
    case 'Attachments':
      return (
        <AttachmentModalityEditor
          {...commonProps}
          attachmentLayout={(structuredResponse?.AttachmentLayout as AttachmentLayoutStructuredResponseItem)?.value}
          editorSettings={editorSettings}
          response={structuredResponse?.Attachments as AttachmentsStructuredResponseItem}
          onAttachmentLayoutChange={onAttachmentLayoutChange}
        />
      );
    case 'Speak':
      return (
        <SpeechModalityEditor
          {...commonProps}
          inputHint={(structuredResponse?.InputHint as InputHintStructuredResponseItem)?.value}
          response={structuredResponse?.Speak as SpeechStructuredResponseItem}
          onInputHintChange={onInputHintChange}
        />
      );
    case 'SuggestedActions':
      return (
        <SuggestedActionsModalityEditor
          {...commonProps}
          response={structuredResponse?.SuggestedActions as SuggestedActionsStructuredResponseItem}
        />
      );
    case 'Text':
      return <TextModalityEditor {...commonProps} response={structuredResponse?.Text as TextStructuredResponseItem} />;
  }
};

const getInitialModalities = (structuredResponse?: PartialStructuredResponse): ModalityType[] => {
  const modalities = Object.keys(structuredResponse || {}).filter((m) =>
    modalityTypes.includes(m as ModalityType)
  ) as ModalityType[];
  return modalities.length ? modalities : ['Text'];
};

type Props = {
  lgOption?: LGOption;
  lgTemplates?: readonly LgTemplate[];
  memoryVariables?: readonly string[];
  structuredResponse?: PartialStructuredResponse;
  telemetryClient: TelemetryClient;
  editorSettings?: Partial<CodeEditorSettings>;
  onTemplateChange: (templateId: string, body?: string) => void;
  onRemoveTemplate: (templateId: string) => void;
};

export const ModalityPivot = React.memo((props: Props) => {
  const {
    lgOption,
    lgTemplates,
    memoryVariables,
    structuredResponse: initialStructuredResponse,
    telemetryClient,
    editorSettings,
    onTemplateChange,
    onRemoveTemplate,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  const [structuredResponse, setStructuredResponse] = React.useState(initialStructuredResponse);
  const [modalities, setModalities] = useState<ModalityType[]>(getInitialModalities(structuredResponse));
  const [selectedModality, setSelectedModality] = useState<string>(modalities[0] as string);

  const renderMenuItemContent = React.useCallback(
    (itemProps: IContextualMenuItemProps, defaultRenders: IContextualMenuItemRenderFunctions) =>
      itemProps.item.itemType === ContextualMenuItemType.Header ? (
        <ItemWithTooltip
          itemText={defaultRenders.renderItemName(itemProps)}
          tooltipId="modality-add-menu-header"
          tooltipText={formatMessage.rich('To learn more, <a>visit this document</a>.', {
            a: ({ children }) => (
              <Link key="modality-add-menu-header-link" href={modalityDocumentUrl} target="_blank">
                {children}
              </Link>
            ),
          })}
        />
      ) : (
        <ItemWithTooltip
          itemText={defaultRenders.renderItemName(itemProps)}
          tooltipId={itemProps.item.key}
          tooltipText={getModalityTooltipText(itemProps.item.key as ModalityType)}
        />
      ),
    []
  );

  const items = useMemo<IContextualMenuItem[]>(
    () => [
      {
        key: 'header',
        itemType: ContextualMenuItemType.Header,
        text: formatMessage('Add more to this response'),
        onRenderContent: renderMenuItemContent,
      },
      {
        key: 'Text',
        text: formatMessage('Text'),
        onRenderContent: renderMenuItemContent,
        style: menuItemStyle,
      },
      {
        key: 'Speak',
        text: formatMessage('Speech'),
        onRenderContent: renderMenuItemContent,
        style: menuItemStyle,
      },
      {
        key: 'Attachments',
        text: formatMessage('Attachments'),
        onRenderContent: renderMenuItemContent,
        style: menuItemStyle,
      },
      {
        key: 'SuggestedActions',
        text: formatMessage('Suggested Actions'),
        onRenderContent: renderMenuItemContent,
        style: menuItemStyle,
      },
    ],
    [renderMenuItemContent]
  );

  const pivotItems = useMemo(
    () =>
      modalityTypes
        .filter((m) => modalities.includes(m))
        .map((modality) => items.find(({ key }) => key === modality))
        .filter(Boolean) as IContextualMenuItem[],
    [items, modalities]
  );
  const menuItems = useMemo(() => items.filter(({ key }) => !modalities.includes(key as ModalityType)), [
    items,
    modalities,
  ]);

  const onRemoveModality = useCallback(
    (modality: ModalityType, keepReferencedTemplates = false) => {
      if (modalities.length > 1) {
        const updatedModalities = modalities.filter((item) => item !== modality);
        setModalities(updatedModalities);
        setSelectedModality(updatedModalities[0] as string);

        if (lgOption?.templateId) {
          const mergedResponse = mergeWith({}, structuredResponse) as PartialStructuredResponse;
          delete mergedResponse[modality];

          setStructuredResponse(mergedResponse);
          const mappedResponse = structuredResponseToString(mergedResponse);
          onTemplateChange(lgOption.templateId, mappedResponse);

          // Remove template that was created by this modality to represent its variations
          // Only Speak and Text are eligible
          if (arrayBasedStructuredResponses.includes(modality)) {
            const templateId = getTemplateId(structuredResponse?.[modality] as ArrayBasedStructuredResponseItem);

            if (templateId) {
              onRemoveTemplate(templateId);
            }
          }

          // Remove attachments created by the LG Response Editor
          if (modality === 'Attachments' && !keepReferencedTemplates) {
            const attachments = (structuredResponse?.[modality] as AttachmentsStructuredResponseItem)?.value || [];
            for (const attachment of attachments) {
              const templateId = extractTemplateNameFromExpression(attachment);
              if (templateId?.startsWith(`${lgOption.templateId}_attachment_`)) {
                onRemoveTemplate(templateId);
              }
            }
          }
        }
        telemetryClient.track('LGEditorModalityDeleted', { modality });
      }
    },
    [lgOption, modalities, structuredResponse, telemetryClient, onRemoveTemplate, onTemplateChange]
  );

  const onModalityAddMenuItemClick = useCallback(
    (_, item?: IContextualMenuItem) => {
      if (item?.key) {
        setModalities((current) => [...current, item.key as ModalityType]);
        setSelectedModality(item.key);
        telemetryClient.track('LGEditorModalityAdded', { modality: item.key });
      }
    },
    [telemetryClient]
  );

  const onPivotChange = useCallback((item?: PivotItem) => {
    if (item?.props.itemKey) {
      setSelectedModality(item?.props.itemKey);
    }
  }, []);

  const onUpdateResponseTemplate = React.useCallback(
    (partialResponse: PartialStructuredResponse) => {
      if (lgOption?.templateId) {
        const mergedResponse = mergeWith({}, structuredResponse, partialResponse, (_, srcValue) => {
          if (Array.isArray(srcValue)) {
            return srcValue;
          }
        });
        setStructuredResponse(mergedResponse);

        const mappedResponse = structuredResponseToString(mergedResponse);
        onTemplateChange(lgOption.templateId, mappedResponse);
      }
    },
    [lgOption, structuredResponse, onTemplateChange]
  );

  const onAttachmentLayoutChange = useCallback(
    (layout: string) => {
      onUpdateResponseTemplate({
        AttachmentLayout: { kind: 'AttachmentLayout', value: layout } as AttachmentLayoutStructuredResponseItem,
      });
    },
    [onUpdateResponseTemplate]
  );

  const onInputHintChange = useCallback(
    (inputHint: string) => {
      onUpdateResponseTemplate({
        InputHint: {
          kind: 'InputHint',
          value: inputHint,
        } as InputHintStructuredResponseItem,
      });
    },
    [onUpdateResponseTemplate]
  );

  const addMenuProps = React.useMemo<IContextualMenuProps>(
    () => ({
      items: menuItems,
      onItemClick: onModalityAddMenuItemClick,
    }),
    [menuItems, onModalityAddMenuItemClick]
  );

  return (
    <Stack>
      <Stack horizontal verticalAlign="center">
        <Pivot headersOnly selectedKey={selectedModality} styles={styles.tabs} onLinkClick={onPivotChange}>
          {pivotItems.map(({ key, text }) => (
            <PivotItem key={key} headerText={text} itemKey={key} />
          ))}
        </Pivot>
        {menuItems.filter((item) => item.itemType !== ContextualMenuItemType.Header).length && (
          <IconButton iconProps={addButtonIconProps} menuProps={addMenuProps} onRenderMenuIcon={() => null} />
        )}
      </Stack>

      <div ref={containerRef}>
        {renderModalityEditor({
          removeModalityDisabled: modalities.length === 1,
          structuredResponse,
          modality: selectedModality,
          lgOption,
          lgTemplates,
          memoryVariables,
          telemetryClient,
          editorSettings,
          onRemoveModality,
          onRemoveTemplate,
          onTemplateChange,
          onAttachmentLayoutChange,
          onInputHintChange,
          onUpdateResponseTemplate,
        })}
      </div>
    </Stack>
  );
});
