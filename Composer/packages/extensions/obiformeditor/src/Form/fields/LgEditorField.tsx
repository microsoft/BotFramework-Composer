import React from 'react';
import { useState, useEffect } from 'react';
import { LgEditor } from 'code-editor';
import * as Monaco from '@bfcomposer/monaco-editor/esm/vs/editor/editor.api';

import { BFDFieldProps } from '../types';

import { BaseField } from './BaseField';

const focusEditor = (editor: Monaco.editor.IStandaloneCodeEditor | null): void => {
  if (editor !== null) {
    editor.focus();
  }
};

const getInitialTemplate = (formData?: string): string => {
  let newTemplate = formData || '';

  if (newTemplate.indexOf('bfdactivity-') !== -1) {
    return '';
  } else if (newTemplate && !newTemplate.startsWith('-')) {
    newTemplate = `-${newTemplate}`;
  }

  return newTemplate;
};
export const LgEditorField: React.FC<BFDFieldProps> = props => {
  const { formContext } = props;
  const lgId = `bfdactivity-${formContext.dialogId}`;
  const [errorMsg, setErrorMsg] = useState('');

  const lgFileId = formContext.currentDialog.lgFile;
  const lgFile = formContext.lgFiles.find(file => file.id === lgFileId);
  const [content, setContent] = useState(lgFile ? lgFile.content : '');
  const template = lgFile
    ? lgFile.templates.find(template => {
        return template.Name === lgId;
      })
    : undefined;
  // template body code range
  const codeRange = template
    ? {
        startLineNumber: template.Range.startLineNumber + 1, // cut template name
        endLineNumber: template.Range.endLineNumber,
      }
    : undefined;

  useEffect(() => {
    // reset content with file.content's initial state
    setContent(lgFile ? lgFile.content : '');
  }, [lgId]);

  const ensureTemplate = async (newBody?: string): Promise<void> => {
    if (template === null || template === undefined) {
      const newTemplate = getInitialTemplate(newBody);

      if (formContext.dialogId && newTemplate) {
        formContext.shellApi.updateLgTemplate(lgFileId, lgId, newTemplate);
        props.onChange(`[${lgId}]`);
      }
    }
  };

  const onChange = (data): void => {
    // hit the lg api and replace it's Body with data
    if (formContext.dialogId) {
      const newContent = data.trim();
      formContext.shellApi
        .updateLgFile(lgFileId, newContent)
        .then(() => setErrorMsg(''))
        .catch(error => setErrorMsg(error));
      props.onChange(`[${lgId}]`);
    }
  };

  useEffect(() => {
    ensureTemplate(props.formData);
  }, [formContext.dialogId]);

  return (
    <div>
      <BaseField {...props}>
        <div
          style={{
            height: '250px',
            paddingBottom: '19px',
          }}
        >
          <LgEditor
            codeRange={codeRange}
            editorDidMount={editor => {
              focusEditor(editor);
            }}
            errorMsg={errorMsg}
            value={content}
            onChange={onChange}
          />
        </div>
      </BaseField>
    </div>
  );
};
