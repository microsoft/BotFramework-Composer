// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState, useMemo, useEffect } from 'react';
import { LgEditor } from '@bfc/code-editor';
import { LgMetaData, LgTemplateRef } from '@bfc/shared';
import debounce from 'lodash/debounce';
import { filterTemplateDiagnostics } from '@bfc/indexers';
var lspServerPath = '/lg-language-server';
var LG_HELP =
  'https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md';
var tryGetLgMetaDataType = function(lgText) {
  var lgRef = LgTemplateRef.parse(lgText);
  if (lgRef === null) return null;
  var lgMetaData = LgMetaData.parse(lgRef.name);
  if (lgMetaData === null) return null;
  return lgMetaData.type;
};
var getInitialTemplate = function(fieldName, formData) {
  var lgText = formData || '';
  // Field content is already a ref created by composer.
  if (tryGetLgMetaDataType(lgText) === fieldName) {
    return '';
  }
  return lgText.startsWith('-') ? lgText : '- ' + lgText;
};
export var LgEditorWidget = function(props) {
  var formContext = props.formContext,
    name = props.name,
    value = props.value,
    _a = props.height,
    height = _a === void 0 ? 250 : _a;
  var lgName = new LgMetaData(name, formContext.dialogId || '').toString();
  var lgFileId = formContext.currentDialog.lgFile || 'common';
  var lgFile =
    formContext.lgFiles &&
    formContext.lgFiles.find(function(file) {
      return file.id === lgFileId;
    });
  var updateLgTemplate = useMemo(
    function() {
      return debounce(function(body) {
        formContext.shellApi.updateLgTemplate(lgFileId, lgName, body).catch(function() {});
      }, 500);
    },
    [lgName, lgFileId]
  );
  var template = (lgFile &&
    lgFile.templates &&
    lgFile.templates.find(function(template) {
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
  var diagnostic = lgFile && filterTemplateDiagnostics(lgFile.diagnostics, template)[0];
  var errorMsg = diagnostic
    ? diagnostic.message.split('error message: ')[diagnostic.message.split('error message: ').length - 1]
    : '';
  var _b = useState(template.body),
    localValue = _b[0],
    setLocalValue = _b[1];
  var lgOption = {
    fileId: lgFileId,
    templateId: lgName,
  };
  var onChange = function(body) {
    setLocalValue(body);
    if (formContext.dialogId) {
      if (body) {
        updateLgTemplate(body);
        props.onChange(new LgTemplateRef(lgName).toString());
      } else {
        updateLgTemplate.flush();
        formContext.shellApi.removeLgTemplate(lgFileId, lgName);
        props.onChange();
      }
    }
  };
  // update the template on mount to get validation
  useEffect(function() {
    if (localValue) {
      updateLgTemplate(localValue);
    }
  }, []);
  return React.createElement(LgEditor, {
    onChange: onChange,
    value: localValue,
    lgOption: lgOption,
    errorMsg: errorMsg,
    hidePlaceholder: true,
    helpURL: LG_HELP,
    languageServer: {
      path: lspServerPath,
    },
    height: height,
  });
};
export default LgEditorWidget;
//# sourceMappingURL=LgEditorWidget.js.map
