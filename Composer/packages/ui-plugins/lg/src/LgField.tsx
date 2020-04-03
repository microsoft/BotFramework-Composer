// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { LgEditor } from '@bfc/code-editor';
import { FieldProps, useShellApi } from '@bfc/extension';
import { FieldLabel } from '@bfc/adaptive-form';
import { LgMetaData, LgTemplateRef } from '@bfc/shared';
import { filterTemplateDiagnostics } from '@bfc/indexers';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';

const lspServerPath = '/lg-language-server';

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

const LgField: React.FC<FieldProps<string>> = props => {
  const { label, id, description, value, name, uiOptions } = props;
  const { designerId, currentDialog, lgFiles, shellApi, projectId, locale } = useShellApi();

  const singleLgRefMatched = value && value.match(`@\\{([A-Za-z_][-\\w]+)(\\([^\\)]*\\))?\\}`);
  const lgName = singleLgRefMatched ? singleLgRefMatched[1] : new LgMetaData(name.trim(), designerId || '').toString();
  const lgFileId = `${currentDialog.lgFile}.${locale}`;
  const lgFile = lgFiles && lgFiles.find(file => file.id === lgFileId);

  const updateLgTemplate = useCallback(
    (body: string) => {
      shellApi.updateLgTemplate(lgFileId, lgName, body).catch(() => {});
    },
    [lgName, lgFileId]
  );

  const hasTemplate = useMemo(() => lgFile?.templates.find(t => t.name === lgName), []);
  const template = (hasTemplate &&
    lgFile?.templates.find(template => {
      return template.name === lgName;
    })) || {
    name: lgName,
    parameters: [],
    body: getInitialTemplate(name, value),
  };

  const [localValue, setLocalValue] = useState(template.body);
  const onChange = (body: string) => {
    setLocalValue(body);
    if (designerId) {
      if (body) {
        updateLgTemplate(body);
        props.onChange(new LgTemplateRef(lgName).toString());
      } else {
        shellApi.removeLgTemplate(lgFileId, lgName);
        props.onChange();
      }
    }
  };

  useEffect(() => {
    // create the lg template if the schema porvides a default value
    if (template.body && !hasTemplate) {
      onChange(template.body);
    }
  }, []);

  const diagnostics = lgFile ? filterTemplateDiagnostics(lgFile.diagnostics, template) : [];

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
    projectId,
    fileId: lgFileId,
    templateId: lgName,
  };

  return (
    <React.Fragment>
      <FieldLabel id={id} label={label} description={description} helpLink={uiOptions?.helpLink} />
      <LgEditor
        height={100}
        value={localValue}
        onChange={onChange}
        diagnostics={diagnostics}
        hidePlaceholder
        languageServer={{
          path: lspServerPath,
        }}
        lgOption={lgOption}
      />
    </React.Fragment>
  );
};

export { LgField };
