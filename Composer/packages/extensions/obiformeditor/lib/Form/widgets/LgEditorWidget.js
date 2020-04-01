// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { LgEditor } from '@bfc/code-editor';
import { LgMetaData, LgTemplateRef } from '@bfc/shared';
import { filterTemplateDiagnostics } from '@bfc/indexers';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
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
  var _a;
  var formContext = props.formContext,
    name = props.name,
    value = props.value,
    _b = props.height,
    height = _b === void 0 ? 250 : _b;
  // refered lgTemplateId may not equal to dialogId. find in value at first.
  var singleLgRefMatched =
    (_a = value) === null || _a === void 0 ? void 0 : _a.match('@\\{([A-Za-z_][-\\w]+)(\\([^\\)]*\\))?\\}');
  var lgName = singleLgRefMatched ? singleLgRefMatched[1] : new LgMetaData(name, formContext.dialogId || '').toString();
  var lgFileId = formContext.currentDialog.lgFile + '.' + formContext.locale;
  var lgFile =
    formContext.lgFiles &&
    formContext.lgFiles.find(function(file) {
      return file.id === lgFileId;
    });
  var updateLgTemplate = useCallback(
    function(body) {
      formContext.shellApi.updateLgTemplate(lgFileId, lgName, body).catch(function() {});
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
  var diagnostics = lgFile ? filterTemplateDiagnostics(lgFile.diagnostics, template) : [];
  var _c = useState(template.body),
    localValue = _c[0],
    setLocalValue = _c[1];
  var sync = useRef(
    debounce(function(shellData, localData) {
      if (!isEqual(shellData, localData)) {
        setLocalValue(shellData);
      }
    }, 750)
  ).current;
  useEffect(
    function() {
      sync(template.body, localValue);
      return function() {
        sync.cancel();
      };
    },
    [template.body]
  );
  var lgOption = {
    projectId: formContext.projectId,
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
        formContext.shellApi.removeLgTemplate(lgFileId, lgName);
        props.onChange();
      }
    }
  };
  return React.createElement(LgEditor, {
    onChange: onChange,
    value: localValue,
    lgOption: lgOption,
    diagnostics: diagnostics,
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
