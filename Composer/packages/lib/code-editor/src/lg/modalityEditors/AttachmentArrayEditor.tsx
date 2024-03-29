// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CodeEditorSettings, LgTemplate, TelemetryClient } from '@bfc/shared';
import formatMessage from 'format-message';
import { CommandButton, IButtonStyles } from '@fluentui/react/lib/Button';
import { FluentTheme } from '@fluentui/theme';
import {
  IContextualMenuItem,
  IContextualMenuProps,
  IContextualMenuItemProps,
} from '@fluentui/react/lib/ContextualMenu';
import { Text } from '@fluentui/react/lib/Text';
import { Stack } from '@fluentui/react/lib/Stack';
import React from 'react';
import debounce from 'lodash/debounce';

import { LGOption } from '../../utils';
import { lgCardAttachmentTemplates, LgCardTemplateType, cardTemplates, jsLgToolbarMenuClassName } from '../constants';
import { getUniqueTemplateName } from '../../utils/lgUtils';

import { StringArrayItem } from './StringArrayItem';

const inputs = ['input', 'textarea'];

const getLgCardTemplateDisplayName = (attachmentType: LgCardTemplateType) => {
  switch (attachmentType) {
    case 'hero':
      return formatMessage('Hero card');
    case 'thumbnail':
      return formatMessage('Thumbnail card');
    case 'signin':
      return formatMessage('Sign-in card');
    case 'animation':
      return formatMessage('Animation card');
    case 'video':
      return formatMessage('Video card');
    case 'audio':
      return formatMessage('Audio card');
    case 'adaptive':
      return formatMessage('Adaptive card');
  }
};

const styles: { button: IButtonStyles } = {
  button: {
    root: {
      color: FluentTheme.palette.themePrimary,
      fontSize: FluentTheme.fonts.small.fontSize,
      ':hover .ms-Button-label, :active .ms-Button-label, :focus .ms-Button-label': {
        color: FluentTheme.palette.themeDarker,
      },
    },
  },
};

const addButtonMenuItemProps: Partial<IContextualMenuItemProps> = { styles: { label: { ...FluentTheme.fonts.small } } };

const attachmentDisplayTextContainerTokens = { childrenGap: 4 };
const attachmentDisplayTextCardTypeStyles = { root: { color: FluentTheme.palette.neutralTertiary, fontWeight: '600' } };
const attachmentDisplayTextTitleStyles = {
  root: { overflowX: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
};

type AttachmentArrayEditorProps = {
  items: string[];
  selectedKey: string;
  lgTemplates?: readonly LgTemplate[];
  memoryVariables?: readonly string[];
  lgOption?: LGOption;
  onChange: (items: string[]) => void;
  onRemoveTemplate: (templateId: string) => void;
  onTemplateChange: (templateId: string, body?: string) => void;
  telemetryClient: TelemetryClient;
  codeEditorSettings?: Partial<CodeEditorSettings>;
};

export const AttachmentArrayEditor = React.memo(
  ({
    items,
    lgOption,
    lgTemplates,
    memoryVariables,
    onChange,
    onTemplateChange,
    onRemoveTemplate,
    telemetryClient,
    codeEditorSettings,
  }: AttachmentArrayEditorProps) => {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const [currentIndex, setCurrentIndex] = React.useState<number | null>(null);
    const [editorExpanded, setEditorExpanded] = React.useState(false);

    const editorPopToggle = React.useCallback((expanded: boolean) => setEditorExpanded(expanded), []);

    const debouncedChange = React.useCallback(
      debounce((id: string, content: string | undefined, callback: (templateId: string, body?: string) => void) => {
        callback(id, content);
      }, 300),
      [],
    );

    const onLgCodeChange = React.useCallback(
      (templateId: string) => (body?: string) => {
        debouncedChange(templateId, body, onTemplateChange);
      },
      [debouncedChange, onTemplateChange],
    );

    const onFocus = React.useCallback(
      (index: number) => () => {
        setCurrentIndex(index);
      },
      [],
    );

    const onRemove = React.useCallback(
      (templateId: string) => () => {
        const newItems = items.filter((id) => id !== templateId);
        onChange(newItems);
        onRemoveTemplate(templateId);
      },
      [items, onChange, onRemoveTemplate],
    );

    const onAddTemplateClick = React.useCallback(
      (_, item?: IContextualMenuItem) => {
        if (item) {
          const templateId = getUniqueTemplateName(`${lgOption?.templateId}_attachment`, lgTemplates);
          onChange([...items, templateId]);
          onTemplateChange(templateId, item?.data.template);
          setCurrentIndex(items.length);
        }
      },
      [items, lgOption, lgTemplates, onChange, onTemplateChange],
    );

    const newButtonMenuItems = React.useMemo<IContextualMenuItem[]>(
      () => [
        {
          key: 'template',
          text: formatMessage('Create from template'),
          itemProps: addButtonMenuItemProps,
          subMenuProps: {
            items: lgCardAttachmentTemplates.map((templateType) => ({
              key: templateType,
              text: getLgCardTemplateDisplayName(templateType),
              onClick: onAddTemplateClick,
              itemProps: addButtonMenuItemProps,
              data: {
                template: cardTemplates[templateType],
              },
            })),
          },
        },
        {
          key: 'addCustom',
          text: formatMessage('Add Custom'),
          itemProps: addButtonMenuItemProps,
          onClick: onAddTemplateClick,
          data: {
            template: '',
          },
        },
      ],
      [onAddTemplateClick],
    );

    const addButtonMenuProps = React.useMemo<IContextualMenuProps>(
      () => ({ items: newButtonMenuItems }),
      [newButtonMenuItems],
    );

    React.useEffect(() => {
      const keydownHandler = (e: KeyboardEvent) => {
        if (
          e.key === 'Escape' &&
          (!document.activeElement || inputs.includes(document.activeElement.tagName.toLowerCase()))
        ) {
          setCurrentIndex(null);
          // Remove empty variations only if necessary
          if (items.some((item) => !item)) {
            onChange(items.filter(Boolean));
          }
        }
      };

      const focusHandler = (e: FocusEvent) => {
        if (containerRef.current?.contains(e.target as Node)) {
          return;
        }

        if (editorExpanded) {
          return;
        }

        if (
          !e
            .composedPath()
            .filter((n) => n instanceof Element)
            .map((n) => (n as Element).className)
            .some((c) => c.indexOf(jsLgToolbarMenuClassName) !== -1)
        ) {
          setCurrentIndex(null);
          // Remove empty variations only if necessary
          if (items.some((item) => !item)) {
            onChange(items.filter(Boolean));
          }
        }
      };

      document.addEventListener('keydown', keydownHandler);
      document.addEventListener('focusin', focusHandler);

      return () => {
        document.removeEventListener('keydown', keydownHandler);
        document.removeEventListener('focusin', focusHandler);
      };
    }, [items, editorExpanded, onChange]);

    const templates: LgTemplate[] = React.useMemo(() => {
      return items.map((name) => {
        return lgTemplates?.find((template) => template.name === name) || { name, body: '', parameters: [] };
      }, []);
    }, [items, lgTemplates]);

    const onRenderDisplayText = React.useCallback(
      (index: number) => () => {
        const cardType = templates[index].properties?.$type as string;
        const title = (templates[index].properties?.title as string) ?? '';
        return cardType ? (
          <Stack horizontal tokens={attachmentDisplayTextContainerTokens} verticalAlign="center">
            <Text styles={attachmentDisplayTextCardTypeStyles} variant="small">
              {`[${cardType}]`}
            </Text>
            <Text styles={attachmentDisplayTextTitleStyles} variant="small">
              {title}
            </Text>
          </Stack>
        ) : (
          templates[index].body
        );
      },
      [templates],
    );

    return (
      <div ref={containerRef}>
        {templates.map(({ name, body }, idx) => (
          <StringArrayItem
            key={`item-${idx}`}
            codeEditorSettings={codeEditorSettings}
            editorMode="editor"
            lgOption={lgOption}
            lgTemplates={lgTemplates}
            memoryVariables={memoryVariables}
            mode={idx === currentIndex ? 'edit' : 'view'}
            removeTooltipTextContent={formatMessage('Remove attachment')}
            telemetryClient={telemetryClient}
            value={body}
            onEditorPopToggle={editorPopToggle}
            onFocus={onFocus(idx)}
            onLgChange={onLgCodeChange(name)}
            onRemove={onRemove(name)}
            onRenderDisplayText={onRenderDisplayText(idx)}
          />
        ))}
        {currentIndex === null && (
          <CommandButton menuProps={addButtonMenuProps} styles={styles.button} onRenderMenuIcon={() => null}>
            {formatMessage('Add new attachment')}
          </CommandButton>
        )}
      </div>
    );
  },
);
