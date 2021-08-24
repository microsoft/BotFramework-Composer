// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import formatMessage from 'format-message';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import React from 'react';

import { richEditorEmoji, richEditorLineHeight, richEditorMaxLines, richEditorMinLines } from './constants';
import { richEditorPluginsConfig } from './plugins';
import { richEditorToolbarToolbarConfig, richEditorImageToolbarConfig, richEditorAlignmentConfig } from './config';

type Props = {
  id?: string;
  value?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onReady?: (editor: any) => void;
  onFocus?: (event: any, editor: any) => void;
  onBlur?: (event: any, editor: any) => void;
};

export const RichEditor = (props: Props) => {
  const { id, value = '', disabled = false, onReady, onChange, onFocus, onBlur } = props;

  const toolbarPanelRef = React.useRef<any>();

  const [editor, setEditor] = React.useState<any>();
  const [error, setError] = React.useState<Error | undefined>();

  React.useEffect(() => {
    if (editor) {
      toolbarPanelRef.current = editor.ui.view.stickyPanel;

      editor.editing.view.change((writer) => {
        writer.setStyle(
          'min-height',
          `${richEditorMinLines * richEditorLineHeight}px`,
          editor.editing.view.document.getRoot()
        );
        writer.setStyle(
          'max-height',
          `${richEditorMaxLines * richEditorLineHeight}px`,
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
  }, [editor]);

  const ready = React.useCallback(
    (editor: any) => {
      setEditor(editor);
      onReady?.(editor);
    },
    [onReady]
  );

  const change = React.useCallback(
    (_, editor) => {
      const data = editor.getData();
      onChange?.(data);
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
          emoji: richEditorEmoji,
          plugins: richEditorPluginsConfig,
          toolbar: richEditorToolbarToolbarConfig,
          image: richEditorImageToolbarConfig,
          alignment: richEditorAlignmentConfig,
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
