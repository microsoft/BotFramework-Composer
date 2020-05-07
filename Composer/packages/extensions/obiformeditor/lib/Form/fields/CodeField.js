// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
import React, { useState } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import formatMessage from 'format-message';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/clike/clike';
import 'codemirror/lib/codemirror.css';
import './codemirror-fabric.css';
import './styles.css';
import { BaseField } from './BaseField';
var cmOptions = {
  theme: 'fabric',
  viewportMargin: Infinity,
  lineNumbers: true,
  lineWrapping: true,
  indentWithTabs: false,
  tabSize: 2,
  smartIndent: true,
  height: 'auto',
};
var modeOptions = [
  {
    text: 'C#',
    key: 'text/x-csharp',
  },
  {
    text: 'Javscript',
    key: 'javascript',
  },
];
export var CodeField = function(props) {
  var _a = useState('javascript'),
    mode = _a[0],
    setMode = _a[1];
  var initialData = useState(props.formData)[0];
  return React.createElement(
    BaseField,
    __assign({}, props, { className: 'CodeField' }),
    React.createElement(
      MessageBar,
      { messageBarType: MessageBarType.warning },
      React.createElement('strong', null, formatMessage('Experimental:')),
      '\u00A0',
      formatMessage('The code step is experimental. It should be used cautiously.')
    ),
    React.createElement(
      'div',
      { className: 'CodeFieldModeSelector' },
      React.createElement(Dropdown, {
        label: formatMessage('Language'),
        options: modeOptions,
        selectedKey: mode,
        onChange: function(e, item) {
          if (item) {
            setMode(item.key);
          }
        },
      })
    ),
    React.createElement(CodeMirror, {
      value: initialData,
      options: __assign(__assign({}, cmOptions), { mode: mode }),
      onChange: function(editor, data, value) {
        props.onChange(value);
      },
      autoCursor: false,
    })
  );
};
//# sourceMappingURL=CodeField.js.map
