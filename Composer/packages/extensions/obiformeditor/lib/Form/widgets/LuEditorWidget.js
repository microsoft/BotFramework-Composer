// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState, useMemo, useEffect } from 'react';
import { LuEditor } from '@bfc/code-editor';
import debounce from 'lodash/debounce';
export var LuEditorWidget = function(props) {
  var formContext = props.formContext,
    name = props.name,
    _a = props.height,
    height = _a === void 0 ? 250 : _a;
  var luFileId = formContext.currentDialog.id;
  var luFile = formContext.luFiles.find(function(f) {
    return f.id === luFileId;
  });
  var luIntent = (luFile &&
    luFile.intents.find(function(intent) {
      return intent.Name === name;
    })) || {
    Name: name,
    Body: '',
  };
  var updateLuIntent = useMemo(
    function() {
      return debounce(function(body) {
        formContext.shellApi.updateLuIntent(luFileId, name, { Name: name, Body: body }).catch(function() {});
      }, 500);
    },
    [name, luFileId]
  );
  // TODO
  var diagnostic = { message: '' };
  var errorMsg = diagnostic
    ? diagnostic.message.split('error message: ')[diagnostic.message.split('error message: ').length - 1]
    : '';
  var _b = useState(luIntent.Body),
    localValue = _b[0],
    setLocalValue = _b[1];
  // updating localValue when getting newest luIntent Data
  // it will be deleted after leilei's pr: fix: Undo / redo behavior on LG resources
  useEffect(
    function() {
      if (!localValue) {
        setLocalValue(luIntent.Body);
      }
    },
    [luIntent.Body]
  );
  var onChange = function(body) {
    setLocalValue(body);
    if (luFileId) {
      if (body) {
        updateLuIntent(body);
      } else {
        updateLuIntent.flush();
        formContext.shellApi.removeLuIntent(luFileId, name);
      }
    }
  };
  // update the template on mount to get validation
  useEffect(function() {
    if (localValue) {
      updateLuIntent(localValue);
    }
  }, []);
  return React.createElement(LuEditor, {
    onChange: onChange,
    value: localValue,
    errorMsg: errorMsg,
    hidePlaceholder: true,
    height: height,
  });
};
export default LuEditorWidget;
//# sourceMappingURL=LuEditorWidget.js.map
