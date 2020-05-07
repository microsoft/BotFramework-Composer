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
import React, { useState, Suspense, useEffect } from 'react';
import formatMessage from 'format-message';
import { Dropdown, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { combineMessage } from '@bfc/indexers';
import { BaseField } from '../BaseField';
import { LoadingSpinner } from '../../../LoadingSpinner';
import ToggleEditor from './ToggleEditor';
import RegexEditor from './RegexEditor';
import './styles.css';
var InlineLuEditor = React.lazy(function() {
  return import('./InlineLuEditor');
});
export var RecognizerField = function(props) {
  var formData = props.formData;
  var _a = useState(false),
    loading = _a[0],
    setLoading = _a[1];
  var _b = useState(''),
    errorMsg = _b[0],
    setErrorMsg = _b[1];
  var _c = props.formContext,
    luFiles = _c.luFiles,
    shellApi = _c.shellApi,
    currentDialog = _c.currentDialog,
    onChange = props.onChange;
  var isRegex = typeof formData === 'object' && formData.$type === 'Microsoft.RegexRecognizer';
  var currentDialogId = currentDialog.id;
  var selectedFile = luFiles.find(function(f) {
    return f.id === currentDialogId;
  });
  var isLuFileSelected = Boolean(
    selectedFile && typeof props.formData === 'string' && props.formData.startsWith(selectedFile.id)
  );
  //make the inline editor show error message
  useEffect(
    function() {
      if (selectedFile && selectedFile.diagnostics.length > 0) {
        var msg = combineMessage(selectedFile.diagnostics);
        setErrorMsg(msg);
      } else {
        setErrorMsg('');
      }
    },
    [selectedFile]
  );
  var handleChange = function(_, option) {
    if (option) {
      switch (option.key) {
        case 'none': {
          onChange(undefined);
          return;
        }
        case 'luis': {
          if (selectedFile) {
            onChange(currentDialogId + '.lu');
          } else {
            var createLuFile = shellApi.createLuFile;
            /**
             * The setTimeouts are used to get around the
             * 1. allows the store to update with the luFile creation
             * 2. allows the debounced onChange to be invoked
             *
             * This is a hack, but dialogs will be created along with
             * lu and lg files so this code path shouldn't be executed.
             */
            setLoading(true);
            createLuFile(currentDialogId).then(function() {
              setTimeout(function() {
                onChange(currentDialogId + '.lu');
                setTimeout(function() {
                  setLoading(false);
                }, 750);
              }, 500);
            });
          }
          return;
        }
        case 'regex': {
          onChange({ $type: 'Microsoft.RegexRecognizer' });
          return;
        }
        default:
          return;
      }
    }
  };
  var options = [
    {
      key: 'none',
      text: formatMessage('None'),
    },
    {
      key: 'luis',
      text: 'LUIS',
    },
    {
      key: 'regex',
      text: formatMessage('Regular Expression'),
    },
  ];
  var getSelectedType = function() {
    if (typeof props.formData === 'string') {
      return 'luis';
    }
    if (isRegex) {
      return 'regex';
    }
    return 'none';
  };
  var onRenderTitle = function(options) {
    if (loading || !options) {
      return React.createElement(
        'div',
        { style: { height: '100%', display: 'flex' } },
        React.createElement(Spinner, { size: SpinnerSize.small })
      );
    }
    var selectedOption = options.find(function(o) {
      return o.key === getSelectedType();
    });
    if (selectedOption) {
      return React.createElement('span', null, selectedOption.text);
    }
    return React.createElement('span', null);
  };
  return React.createElement(
    'div',
    { className: 'RecognizerField' },
    React.createElement(
      BaseField,
      __assign({}, props),
      React.createElement(Dropdown, {
        styles: { root: { paddingRight: '47px' } },
        label: formatMessage('Recognizer Type'),
        onChange: handleChange,
        options: options,
        selectedKey: getSelectedType(),
        responsiveMode: ResponsiveMode.large,
        onRenderTitle: onRenderTitle,
      }),
      React.createElement(
        ToggleEditor,
        {
          key: getSelectedType(),
          title: isLuFileSelected ? 'text editor' : 'regular expression editor',
          loaded: Boolean(!loading && formData),
        },
        function() {
          if (selectedFile && isLuFileSelected) {
            var updateLuFile = function(newValue) {
              shellApi.updateLuFile({ id: selectedFile.id, content: newValue }).catch(setErrorMsg);
            };
            return React.createElement(
              Suspense,
              { fallback: React.createElement(LoadingSpinner, null) },
              React.createElement(InlineLuEditor, { file: selectedFile, onSave: updateLuFile, errorMsg: errorMsg })
            );
          }
          if (isRegex) {
            return React.createElement(RegexEditor, __assign({}, props));
          }
        }
      )
    )
  );
};
//# sourceMappingURL=index.js.map
