import React from 'react';
import { useState, useEffect } from 'react';
import { LgEditor } from 'code-editor';
import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { SharedColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';

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

  const [isInvalid, setIsInvalid] = useState(false);
  const [templateToRender, setTemplateToRender] = useState({ Name: '', Body: '' });
  const lgId = `bfdactivity-${formContext.dialogId}`;

  const ensureTemplate = async (newBody?: string): Promise<void> => {
    const templates = await formContext.shellApi.getLgTemplates('common');
    const template = templates.find(template => {
      return template.Name === lgId;
    });
    if (template === null || template === undefined) {
      const newTemplate = getInitialTemplate(newBody);

      if (formContext.dialogId && newTemplate) {
        formContext.shellApi.updateLgTemplate('common', lgId, newTemplate);
        props.onChange(`[${lgId}]`);
      }
      setTemplateToRender({ Name: `# ${lgId}`, Body: newTemplate });
    } else {
      if (templateToRender.Name === '') {
        setTemplateToRender({ Name: `# ${lgId}`, Body: template.Body });
      }
    }
  };

  const onChange = (data): void => {
    // hit the lg api and replace it's Body with data
    if (formContext.dialogId) {
      let dataToEmit = data.trim();
      if (dataToEmit.length > 0 && dataToEmit[0] !== '-') {
        dataToEmit = `-${dataToEmit}`;
      }

      if (dataToEmit.length > 0) {
        setTemplateToRender({ Name: templateToRender.Name, Body: data });
        formContext.shellApi
          .updateLgTemplate('common', lgId, dataToEmit)
          .then(() => setIsInvalid(false))
          .catch(() => setIsInvalid(true));
        props.onChange(`[${lgId}]`);
      } else {
        setTemplateToRender({ Name: templateToRender.Name, Body: '' });
        formContext.shellApi.removeLgTemplate('common', lgId);
        props.onChange(undefined);
      }
    }
  };

  useEffect(() => {
    ensureTemplate(props.formData);
  }, [formContext.dialogId]);

  const { Body } = templateToRender;
  return (
    <div>
      <BaseField {...props}>
        <div
          style={{
            height: '250px',
            border: '1px solid transparent',
            borderColor: isInvalid ? SharedColors.red20 : 'transparent',
            transition: `border-color 0.1s ${isInvalid ? 'ease-out' : 'ease-in'}`,
          }}
        >
          <LgEditor
            hidePlaceholder
            value={Body}
            onChange={onChange}
            editorDidMount={editor => {
              focusEditor(editor);
            }}
          />
        </div>
        {isInvalid ? (
          <span style={{ fontSize: '14px' }}>
            <span style={{ margin: 0, color: SharedColors.red20, fontSize: '11px' }}>
              {formatMessage.rich(
                'This text cannot be saved because there are errors in the LG syntax. Refer to the syntax documentation <a>here</a>.',
                {
                  // eslint-disable-next-line react/display-name
                  a: ({ children }) => (
                    <a
                      key="a"
                      href="https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                }
              )}
            </span>
          </span>
        ) : (
          <div style={{ height: '19px' }} />
        )}
      </BaseField>
    </div>
  );
};
