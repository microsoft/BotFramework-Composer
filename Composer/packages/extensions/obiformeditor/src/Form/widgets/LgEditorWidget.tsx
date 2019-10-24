import React, { useState, useMemo, useLayoutEffect } from 'react';
import { LgEditor } from 'code-editor';
import debounce from 'lodash.debounce';
import * as monacoEditor from '@bfcomposer/monaco-editor/esm/vs/editor/editor.api';

import { FormContext } from '../types';

const LG_HELP =
  'https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md';

const getInitialTemplate = (fieldName: string, formData?: string): string => {
  let newTemplate = formData || '- ';

  if (newTemplate.includes(`bfd${fieldName}-`)) {
    return '';
  } else if (newTemplate && !newTemplate.startsWith('-')) {
    newTemplate = `-${newTemplate}`;
  }

  return newTemplate;
};

interface LgEditorWidgetProps {
  formContext: FormContext;
  name: string;
  value?: string;
  height?: number | string;
  onChange: (template?: string) => void;
}

export const LgEditorWidget: React.FC<LgEditorWidgetProps> = props => {
  const { formContext, name, value, height = 250 } = props;
  const [errorMsg, setErrorMsg] = useState('');
  const [editor, setEditor] = useState<monacoEditor.editor.IStandaloneCodeEditor>();
  const lgId = `bfd${name}-${formContext.dialogId}`;
  const lgFileId = formContext.currentDialog.lgFile || 'common';
  const lgFile = formContext.lgFiles.find(file => file.id === lgFileId);

  const updateLgTemplate = useMemo(
    () =>
      debounce((body: string) => {
        formContext.shellApi
          .updateLgTemplate(lgFileId, lgId, body)
          .then(() => setErrorMsg(''))
          .catch(error => setErrorMsg(error));
      }, 500),
    [lgId, lgFileId]
  );

  const template = (lgFile &&
    lgFile.templates.find(template => {
      return template.Name === lgId;
    })) || {
    Name: lgId,
    Body: getInitialTemplate(name, value),
    Parameters: '',
    Range: {
      startLineNumber: 1,
      endLineNumber: 1,
    },
  };

  // template body code range
  const codeRange = {
    startLineNumber: 2,
    endLineNumber: template.Body.split('\n').length + 1,
  };

  const [localContent, setLocalContent] = useState(template.Body);
  const content = `#${template.Name}\n${localContent}`;

  const onChange = (newTemplate: string) => {
    const [, body] = newTemplate.split(`#${lgId}\n`);

    if (formContext.dialogId) {
      if (body) {
        updateLgTemplate(body);
        props.onChange(`[${lgId}]`);
      } else {
        updateLgTemplate.flush();
        formContext.shellApi.removeLgTemplate(lgFileId, lgId);
        props.onChange();
      }
    }
    setLocalContent(body);
  };

  // useLayoutEffect so that the handler can be updated before the next render
  useLayoutEffect(() => {
    if (editor) {
      const keyDownHandler = editor.onKeyDown(e => {
        switch (e.keyCode) {
          case monacoEditor.KeyCode.Backspace:
            if (!localContent) {
              e.preventDefault();
              e.stopPropagation();
            }

            break;
          case monacoEditor.KeyCode.KEY_A:
            if (e.ctrlKey || e.metaKey) {
              editor.setSelection({
                ...codeRange,
                startColumn: 1,
                endColumn: Infinity,
              });
              e.preventDefault();
              e.stopPropagation();
            }
            break;
          default:
            return;
        }
      });

      return () => {
        keyDownHandler.dispose();
      };
    }
  }, [editor, localContent]);

  const handleEditorMount = (editor: monacoEditor.editor.IStandaloneCodeEditor) => {
    setEditor(editor);
  };

  return (
    <LgEditor
      codeRange={codeRange}
      errorMsg={errorMsg}
      value={content}
      onChange={onChange}
      helpURL={LG_HELP}
      height={height}
      editorDidMount={handleEditorMount}
    />
  );
};
