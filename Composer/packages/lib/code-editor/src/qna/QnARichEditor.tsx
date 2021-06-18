// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-explicit-any */

import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Markdown from '@ckeditor/ckeditor5-markdown-gfm/src/markdown';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import Table from '@ckeditor/ckeditor5-table/src/table';
import Emoji from '@wwalc/ckeditor5-emoji/src/emoji';
import formatMessage from 'format-message';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import React from 'react';

const allowedNavigationKeys = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'];

const emoji = [
  { name: 'smile', text: '😀' },
  { name: 'wink', text: '😉' },
  { name: 'cool', text: '😎' },
  { name: 'surprise', text: '😮' },
  { name: 'sad', text: '🙁' },
  { name: 'wave', text: '👋' },
  { name: 'OK', text: '👌' },
  { name: 'victory', text: '✌' },
  { name: 'like', text: '👍' },
  { name: 'dislike', text: '👎' },
];

const imagePlugins = [Image, ImageToolbar, ImageInsert, ImageStyle, ImageResize];

const pluginsConfig = [
  SourceEditing,
  Markdown,
  Alignment,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Strikethrough,
  Table,
  Essentials,
  Link,
  List,
  Emoji,
  ...imagePlugins,
];

const alignmentConfig = {
  options: ['left', 'right', 'center', 'justify'],
};

const imageConfig = {
  toolbar: ['imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight', '|', 'imageTextAlternative'],
  styles: ['full', 'alignLeft', 'alignCenter', 'alignRight'],
};

const toolbarConfig = {
  items: [
    'sourceediting',
    '|',
    'bold',
    'italic',
    'strikethrough',
    '|',
    'alignment',
    'numberedList',
    'bulletedList',
    '|',
    'heading',
    'insertTable',
    '|',
    'insertImage',
    'link',
    'emoji',
    'undo',
    'redo',
  ],
};

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
  const { 0: sourceEditing, 1: setSourceEditing } = React.useState(false);
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

  const sourceEditHandler = React.useCallback(
    (_e, _d, isSourceEditingMode) => {
      setSourceEditing(isSourceEditingMode);
      editor.ui.view.toolbar.items.get(15).isEnabled = !isSourceEditingMode;
    },
    [editor]
  );

  React.useEffect(() => {
    toggleToolbar(focused || sourceEditing);
  }, [focused, sourceEditing]);

  React.useEffect(() => {
    if (editor) {
      toolbarPanelRef.current = editor.ui.view.stickyPanel;
      toggleToolbar(false);

      editor.ui.focusTracker.on('change:isFocused', focusTrackerHandler);

      const sourceEditingPlugin = editor.plugins.get('SourceEditing');
      sourceEditingPlugin?.on('change:isSourceEditingMode', sourceEditHandler);

      (window as any).editor = editor;

      editor.editing.view.change((writer) => {
        writer.setStyle('min-height', '120px', editor.editing.view.document.getRoot());
      });

      editor.keystrokes.set('space', (_, stop) => {
        editor.execute('input', {
          text: ' ',
        });
        stop();
      });

      allowedNavigationKeys.forEach((navKey) => {
        editor.keystrokes.set(navKey.toLowerCase(), (e) => {
          e.stopPropagation();
        });
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
    <Stack verticalFill>
      <CKEditor
        config={{
          emoji,
          plugins: pluginsConfig,
          toolbar: toolbarConfig,
          image: imageConfig,
          alignment: alignmentConfig,
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
