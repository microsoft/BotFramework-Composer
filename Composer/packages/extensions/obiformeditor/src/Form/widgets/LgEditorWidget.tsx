// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { LgEditor } from '@bfc/code-editor';
import { LgMetaData, LgTemplateRef } from '@bfc/shared';
import { filterTemplateDiagnostics } from '@bfc/indexers';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';

import { FormContext } from '../types';

const lspServerPath = '/lg-language-server';

const LG_HELP =
  'https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md';

const tryGetLgMetaDataType = (lgText: string): string | null => {
  const lgRef = LgTemplateRef.parse(lgText);
  if (lgRef === null) return null;

  const lgMetaData = LgMetaData.parse(lgRef.name);
  if (lgMetaData === null) return null;

  return lgMetaData.type;
};

const getInitialTemplate = (fieldName: string, formData?: string): string => {
  const lgText = formData || '';

  // Field content is already a ref created by composer.
  if (tryGetLgMetaDataType(lgText) === fieldName) {
    return '';
  }
  return lgText.startsWith('-') ? lgText : `- ${lgText}`;
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
  // refered lgTemplateId may not equal to dialogId. find in value at first.
  const singleLgRefMatched = value?.match(`@\\{([A-Za-z_][-\\w]+)(\\([^\\)]*\\))?\\}`);
  const lgName = singleLgRefMatched
    ? singleLgRefMatched[1]
    : new LgMetaData(name, formContext.dialogId || '').toString();
  const lgFileId = formContext.currentDialog.lgFile || 'common';
  const lgFile = formContext.lgFiles && formContext.lgFiles.find(file => file.id === lgFileId);

  const updateLgTemplate = useCallback(
    (body: string) => {
      formContext.shellApi.updateLgTemplate(lgFileId, lgName, body).catch(() => {});
    },
    [lgName, lgFileId]
  );

  const template = (lgFile &&
    lgFile.templates &&
    lgFile.templates.find(template => {
      return template.name === lgName;
    })) || {
    name: lgName,
    parameters: [],
    body: getInitialTemplate(name, value),
    range: {
      startLineNumber: 0,
      endLineNumber: 2,
    },
  };

  const diagnostic = lgFile && filterTemplateDiagnostics(lgFile.diagnostics, template)[0];

  const errorMsg = diagnostic
    ? diagnostic.message.split('error message: ')[diagnostic.message.split('error message: ').length - 1]
    : '';
  const [localValue, setLocalValue] = useState(template.body);
  const sync = useRef(
    debounce((shellData: any, localData: any) => {
      if (!isEqual(shellData, localData)) {
        setLocalValue(shellData);
      }
    }, 750)
  ).current;

  useEffect(() => {
    sync(template.body, localValue);

    return () => {
      sync.cancel();
    };
  }, [template.body]);

  const lgOption = {
    projectId: formContext.projectId,
    fileId: lgFileId,
    templateId: lgName,
  };

  const onChange = (body: string) => {
    setLocalValue(body);
    if (formContext.dialogId) {
      if (body) {
        updateLgTemplate(body);
        props.onChange(new LgTemplateRef(lgName).toString());
      } else {
        formContext.shellApi.removeLgTemplate(lgFileId, lgName);
        props.onChange();
      }
    }
  };

  return (
    <LgEditor
      onChange={onChange}
      value={localValue}
      lgOption={lgOption}
      errorMsg={errorMsg}
      hidePlaceholder={true}
      helpURL={LG_HELP}
      languageServer={{
        path: lspServerPath,
      }}
      height={height}
    />
  );
};

export default LgEditorWidget;
