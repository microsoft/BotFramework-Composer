// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplate, TelemetryClient } from '@bfc/shared';
import { FluentTheme } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import debounce from 'lodash/debounce';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { ILinkStyles, Link } from 'office-ui-fabric-react/lib/Link';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { LGOption } from '../../utils';
import { getCursorContextWithinLine } from '../../utils/lgUtils';
import { jsLgToolbarMenuClassName } from '../constants';
import { LgEditorToolbar } from '../LgEditorToolbar';
import { LgSpeechModalityToolbar, SSMLTagType } from '../LgSpeechModalityToolbar';
import { ToolbarButtonPayload } from '../types';

import { StringArrayItem } from './StringArrayItem';

const submitKeys = ['Enter', 'Escape'];

const styles: { link: ILinkStyles } = {
  link: {
    root: {
      height: 32,
      paddingLeft: 13,
      fontSize: FluentTheme.fonts.small.fontSize,
      ':hover': { textDecoration: 'none' },
      ':active': { textDecoration: 'none' },
    },
  },
};

const prosodyDefaultProps = { pitch: 'medium', rate: 'medium', volume: 'medium' };
const breakDefaultProps = { strength: 'medium' };
const audioDefaultProps = { src: 'url' };

const getSSMLProps = (tag: 'prosody' | 'audio' | 'break'): string => {
  let defaultProps: Record<string, string> = {};
  switch (tag) {
    case 'prosody':
      defaultProps = prosodyDefaultProps;
      break;
    case 'audio':
      defaultProps = audioDefaultProps;
      break;
    case 'break':
      defaultProps = breakDefaultProps;
  }

  return Object.entries(defaultProps)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
};

type StringArrayEditorProps = {
  items: string[];
  lgTemplates?: readonly LgTemplate[];
  memoryVariables?: readonly string[];
  lgOption?: LGOption;
  isSpeech?: boolean;
  onChange: (items: string[]) => void;
  telemetryClient: TelemetryClient;
};

export const StringArrayEditor = React.memo(
  ({ items, lgTemplates, memoryVariables, isSpeech = false, telemetryClient, onChange }: StringArrayEditorProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    const [calloutTargetElement, setCalloutTargetElement] = useState<HTMLInputElement | null>(null);

    const debouncedChange = React.useCallback(
      debounce((items: string[], callback: (arr: string[]) => void) => {
        callback(items);
      }, 300),
      []
    );

    const onItemChange = useCallback(
      (index: number) => (_, newValue?: string) => {
        const updatedItems = [...items];
        updatedItems[index] = newValue ?? '';
        debouncedChange(updatedItems, onChange);
      },
      [debouncedChange, items, onChange]
    );

    const onItemFocus = useCallback(
      (index: number) => () => {
        setCurrentIndex(index);
      },
      []
    );

    const onItemRemove = useCallback(
      (index: number) => () => {
        const newItems = items.filter((_, idx) => idx !== index);
        onChange(newItems);
      },
      [items, onChange]
    );

    const onClickAddVariation = useCallback(() => {
      onChange([...items, '']);
      setCurrentIndex(items.length);
    }, [items, onChange]);

    const onShowCallout = useCallback((targetElement: HTMLInputElement) => {
      setCalloutTargetElement(targetElement);
    }, []);

    useEffect(() => {
      const keydownHandler = (e: KeyboardEvent) => {
        if (submitKeys.includes(e.key)) {
          setCalloutTargetElement(null);
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

        if (
          !e
            .composedPath()
            .filter((n) => n instanceof Element)
            .map((n) => (n as Element).className)
            .some((c) => c.indexOf(jsLgToolbarMenuClassName) !== -1)
        ) {
          setCalloutTargetElement(null);
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
    }, [items, onChange]);

    const onSelectToolbarMenuItem = React.useCallback(
      (text: string, itemType: ToolbarButtonPayload['kind']) => {
        if (typeof currentIndex === 'number' && currentIndex < items.length) {
          const updatedItems = [...items];

          if (typeof calloutTargetElement?.selectionStart === 'number') {
            const item = updatedItems[currentIndex];
            const start = calloutTargetElement.selectionStart;
            const end =
              typeof calloutTargetElement?.selectionEnd === 'number'
                ? calloutTargetElement.selectionEnd
                : calloutTargetElement.selectionStart;
            const context = getCursorContextWithinLine(item.substring(0, start));
            const insertText = context === 'expression' ? text : `\${${text}}`;
            updatedItems[currentIndex] = [item.slice(0, start), insertText, item.slice(end)].join('');
            onChange(updatedItems);

            setTimeout(() => {
              calloutTargetElement.setSelectionRange(
                updatedItems[currentIndex].length,
                updatedItems[currentIndex].length
              );
            }, 0);
          }

          calloutTargetElement?.focus();
        }
        telemetryClient.track('LGQuickInsertItem', {
          itemType,
          item: itemType === 'function' ? text : undefined,
          location: 'LGResponseEditor',
        });
      },
      [calloutTargetElement, currentIndex, items, telemetryClient, onChange]
    );

    const onInsertSSMLTag = React.useCallback(
      (ssmlTagType: SSMLTagType) => {
        if (typeof currentIndex === 'number' && currentIndex < items.length) {
          const updatedItems = [...items];

          if (
            typeof calloutTargetElement?.selectionStart === 'number' &&
            typeof calloutTargetElement?.selectionEnd === 'number'
          ) {
            const item = updatedItems[currentIndex];
            const start = calloutTargetElement.selectionStart;
            const end = calloutTargetElement.selectionEnd;

            if (ssmlTagType === 'break' || ssmlTagType === 'audio') {
              const item = updatedItems[currentIndex];
              const start = calloutTargetElement.selectionStart;
              const end =
                typeof calloutTargetElement?.selectionEnd === 'number'
                  ? calloutTargetElement.selectionEnd
                  : calloutTargetElement.selectionStart;
              updatedItems[currentIndex] = [
                item.slice(0, start),
                `<${ssmlTagType} ${getSSMLProps(ssmlTagType)}/>`,
                item.slice(end),
              ].join('');
            } else {
              updatedItems[currentIndex] = [
                item.slice(0, start),
                `<${ssmlTagType} ${getSSMLProps(ssmlTagType)}>`,
                item.slice(start, end),
                `</${ssmlTagType}>`,
                item.slice(end),
              ].join('');
            }
            onChange(updatedItems);

            setTimeout(() => {
              calloutTargetElement.setSelectionRange(
                updatedItems[currentIndex].length,
                updatedItems[currentIndex].length
              );
            }, 0);
          }

          calloutTargetElement?.focus();
        }
        telemetryClient.track('LGQuickInsertItem', {
          itemType: 'SSML',
          item: ssmlTagType,
          location: 'LGResponseEditor',
        });
      },
      [calloutTargetElement, currentIndex, items, onChange]
    );

    const toolbar = React.useMemo(
      () =>
        isSpeech ? (
          <LgSpeechModalityToolbar
            key="lg-speech-toolbar"
            lgTemplates={lgTemplates}
            properties={memoryVariables}
            onInsertSSMLTag={onInsertSSMLTag}
            onSelectToolbarMenuItem={onSelectToolbarMenuItem}
          />
        ) : (
          <LgEditorToolbar
            key="lg-toolbar"
            lgTemplates={lgTemplates}
            properties={memoryVariables}
            onSelectToolbarMenuItem={onSelectToolbarMenuItem}
          />
        ),
      [isSpeech, lgTemplates, memoryVariables, onInsertSSMLTag, onSelectToolbarMenuItem]
    );

    return (
      <div ref={containerRef}>
        {items.map((value, idx) => (
          <StringArrayItem
            key={`item-${idx}`}
            mode={idx === currentIndex ? 'edit' : 'view'}
            telemetryClient={telemetryClient}
            value={value}
            onChange={onItemChange(idx)}
            onFocus={onItemFocus(idx)}
            onRemove={onItemRemove(idx)}
            onShowCallout={onShowCallout}
          />
        ))}
        {currentIndex === null && (
          <Link as="button" styles={styles.link} onClick={onClickAddVariation}>
            {formatMessage('Add new variation')}
          </Link>
        )}
        {calloutTargetElement && (
          <Callout
            directionalHint={DirectionalHint.topLeftEdge}
            gapSpace={2}
            isBeakVisible={false}
            target={calloutTargetElement}
          >
            {toolbar}
          </Callout>
        )}
      </div>
    );
  }
);
