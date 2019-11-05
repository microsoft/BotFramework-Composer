// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { LgLSPEditor } from '@bfc/code-editor';

import { FormContext } from '../types';

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
  const lgId = `bfd${name}-${formContext.dialogId}`;
  const lgFileId = formContext.currentDialog.lgFile || 'common';
  const lgFile = formContext.lgFiles.find(file => file.id === lgFileId);

  const template = (lgFile &&
    lgFile.templates.find(template => {
      return template.Name === lgId;
    })) || {
    Name: lgId,
    Body: getInitialTemplate(name, value),
    Parameters: [],
    Range: {
      startLineNumber: 1,
      endLineNumber: 1,
    },
  };

  const content = lgFile ? lgFile.content : '';
  const editorFile = {
    uri: 'inmemory://common.lg',
    language: 'botbuilderlg',
    inline: true,
    content,
    template,
  };

  return <LgLSPEditor file={editorFile} height={height} />;
};
