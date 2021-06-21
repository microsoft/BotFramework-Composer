// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-explicit-any */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import formatMessage from 'format-message';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import React from 'react';

import { qnaRichEditorEmoji, qnaRichEditorLineHeight, qnaRichEditorMaxLines, qnaRichEditorMinLines } from './constants';
import { qnaRichEditorPluginsConfig } from './plugins';
import {
  qnaRichEditorToolbarToolbarConfig,
  qnaRichEditorImageToolbarConfig,
  qnaRichEditorAlignmentConfig,
} from './config';

type Props = {
  id: string;
  value?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onReady?: (editor: any) => void;
  onFocus?: (event: any, editor: any) => void;
  onBlur?: (event: any, editor: any) => void;
};

export const QnARichEditor = (props: Props) => {
  const { id, value = '', disabled = false, onReady, onChange, onFocus, onBlur } = props;

  const toolbarPanelRef = React.useRef<any>();

  const { 0: editor, 1: setEditor } = React.useState<any>();
  const { 0: focused, 1: setFocused } = React.useState(false);
  const { 0: error, 1: setError } = React.useState<Error | undefined>();

  const toggleToolbar = React.useCallback(
    (focused: boolean) => {
      if (editor) {
        if (focused) {
          !editor.ui.view.top.has(toolbarPanelRef.current) && editor.ui.view.top.add(toolbarPanelRef.current);
        } else {
          editor.ui.view.top.has(toolbarPanelRef.current) && editor.ui.view.top.remove(toolbarPanelRef.current);
        }
      }
    },
    [editor]
  );

  const focusTrackerHandler = React.useCallback((_e, _d, isFocused) => {
    setFocused(isFocused);
  }, []);

  React.useEffect(() => {
    toggleToolbar(focused);
  }, [focused]);

  React.useEffect(() => {
    if (editor) {
      toolbarPanelRef.current = editor.ui.view.stickyPanel;
      toggleToolbar(false);

      editor.ui.focusTracker.on('change:isFocused', focusTrackerHandler);

      editor.editing.view.change((writer) => {
        writer.setStyle(
          'min-height',
          `${qnaRichEditorMinLines * qnaRichEditorLineHeight}px`,
          editor.editing.view.document.getRoot()
        );
        writer.setStyle(
          'max-height',
          `${qnaRichEditorMaxLines * qnaRichEditorLineHeight}px`,
          editor.editing.view.document.getRoot()
        );
      });

      editor.keystrokes.set('space', (_, stop) => {
        editor.execute('input', {
          text: ' ',
        });
        stop();
      });
    }

    return () => {
      editor?.ui.focusTracker.off('change:isFocused', focusTrackerHandler);
    };
  }, [editor]);

  const ready = React.useCallback(
    (editor: any) => {
      setEditor(editor);
      onReady?.(editor);
    },
    [onReady]
  );

  const change = React.useCallback(
    (e, editor) => {
      const data = editor.getData();
      onChange(data);
    },
    [onChange]
  );

  const focus = React.useCallback(
    (e, editor) => {
      onFocus?.(e, editor);
    },
    [onFocus]
  );

  const blur = React.useCallback(
    (e, editor) => {
      onBlur?.(e, editor);
    },
    [onBlur]
  );

  const onError = React.useCallback((err: Error) => {
    setError(err);
  }, []);

  const dismissError = React.useCallback(() => setError(undefined), []);

  return (
    <Stack verticalFill data-is-focusable="false">
      <CKEditor
        config={{
          emoji: qnaRichEditorEmoji,
          plugins: qnaRichEditorPluginsConfig,
          toolbar: qnaRichEditorToolbarToolbarConfig,
          image: qnaRichEditorImageToolbarConfig,
          alignment: qnaRichEditorAlignmentConfig,
          placeholder: formatMessage('Add an answer'),
        }}
        data={value}
        disabled={disabled}
        editor={ClassicEditor}
        id={id}
        onBlur={blur}
        onChange={change}
        onError={onError}
        onFocus={focus}
        onReady={ready}
      />
      {error ? (
        <MessageBar
          isMultiline
          dismissButtonAriaLabel={formatMessage('Close')}
          messageBarType={MessageBarType.error}
          onDismiss={dismissError}
        >
          {JSON.stringify(error)}
        </MessageBar>
      ) : null}
    </Stack>
  );
};
