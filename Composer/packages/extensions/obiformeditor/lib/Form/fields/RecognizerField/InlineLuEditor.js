// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState } from 'react';
import { LuEditor } from '@bfc/code-editor';
var InlineLuEditor = function(props) {
  var file = props.file,
    onSave = props.onSave,
    errorMsg = props.errorMsg;
  var content = file.content;
  var _a = useState(content || ''),
    localContent = _a[0],
    setLocalContent = _a[1];
  var commitChanges = function(value) {
    setLocalContent(value);
    onSave(value);
  };
  return React.createElement(LuEditor, {
    value: localContent,
    onChange: commitChanges,
    errorMsg: errorMsg,
    height: 450,
  });
};
export default InlineLuEditor;
//# sourceMappingURL=InlineLuEditor.js.map
