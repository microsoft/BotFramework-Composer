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
/** @jsx jsx */
import { Global, jsx } from '@emotion/core';
import { useState, useMemo, useEffect } from 'react';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import merge from 'lodash/merge';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import { appschema } from '@bfc/shared';
import Form from './Form';
import { uiSchema } from './schema/uischema';
import { getMemoryOptions } from './Form/utils';
import { root } from './styles';
var getType = function(data) {
  return data.$type;
};
export var FormEditor = function(props) {
  var data = props.data,
    schemas = props.schemas,
    memory = props.memory,
    dialogs = props.dialogs,
    shellApi = props.shellApi;
  var _a = useState(data),
    localData = _a[0],
    setLocalData = _a[1];
  var type = getType(localData);
  useEffect(
    function() {
      if (!isEqual(localData, data)) {
        setLocalData(data);
      }
    },
    [data]
  );
  var formErrors = useMemo(
    function() {
      if (props.currentDialog && props.currentDialog.diagnostics) {
        var currentPath_1 = props.focusPath.replace('#', '');
        var diagnostics = get(props.currentDialog, 'diagnostics', []);
        return diagnostics.reduce(function(errors, d) {
          var _a, _b, _c, _d;
          var _e = ((_a = d.path) === null || _a === void 0 ? void 0 : _a.split('#')) || [],
            dPath = _e[0],
            dType = _e[1],
            dProp = _e[2];
          var dPropName =
            (_d =
              (_c = (_b = dProp) === null || _b === void 0 ? void 0 : _b.replace('[', '')) === null || _c === void 0
                ? void 0
                : _c.replace(']', '')) === null || _d === void 0
              ? void 0
              : _d.replace('.', '');
          if (dPath === currentPath_1 && dType === type && dPropName) {
            errors[dPropName] = d.message;
          }
          return errors;
        }, {});
      }
      return {};
    },
    [props.currentDialog]
  );
  if (!type) {
    return jsx('div', null, 'Malformed data: missing $type.', jsx('pre', null, JSON.stringify(localData, null, 2)));
  }
  var definitions = appschema.definitions || {};
  var typeDef = definitions[type];
  if (!typeDef) {
    return jsx(
      'div',
      null,
      'Malformed data: missing type defintion in schema.',
      jsx('pre', null, JSON.stringify(localData, null, 2))
    );
  }
  var dialogSchema = __assign(__assign({}, typeDef), { definitions: merge({}, definitions, typeDef.definitions) });
  var dialogUiSchema = __assign({}, uiSchema[type]);
  var dialogOptions = dialogs.map(function(f) {
    return { value: f.id, label: f.displayName };
  });
  var onChange = function(newValue) {
    if (!isEqual(newValue.formData, localData)) {
      props.onChange(newValue.formData);
      setLocalData(newValue.formData);
    }
  };
  var onMemoryDropdownChange = function(event, option) {
    navigator.clipboard.writeText('{' + option.key + '}');
  };
  var memoryOptions = getMemoryOptions(memory);
  return jsx(
    'div',
    null,
    jsx(Global, { styles: root }),
    memoryOptions.length > 0 &&
      jsx(Dropdown, {
        style: { width: '300px', paddingBottom: '10px', paddingLeft: '18px', paddingTop: '18px' },
        placeholder: 'Memory available to this Dialog',
        options: memoryOptions,
        onChange: onMemoryDropdownChange,
        onFocus: function() {},
        selectedKey: null,
      }),
    jsx(
      Form,
      {
        noValidate: true,
        className: 'schemaForm',
        onChange: onChange,
        formData: localData,
        onBlur: props.onBlur,
        schema: dialogSchema,
        uiSchema: dialogUiSchema,
        formContext: {
          shellApi: shellApi,
          dialogOptions: dialogOptions,
          editorSchema: schemas.editor,
          rootId: props.focusPath,
          luFiles: props.luFiles,
          lgFiles: props.lgFiles,
          currentDialog: props.currentDialog,
          dialogId: get(data, '$designer.id'),
          isRoot: props.focusPath.endsWith('#'),
          focusedEvent: props.focusedEvent,
          focusedSteps: props.focusedSteps,
          focusedTab: props.focusedTab,
          formErrors: formErrors,
        },
        idPrefix: props.focusPath,
      },
      jsx('button', { style: { display: 'none' } })
    )
  );
};
FormEditor.defaultProps = {
  onChange: function() {},
  onBlur: function() {},
  schemas: {
    editor: {},
  },
};
export default FormEditor;
//# sourceMappingURL=FormEditor.js.map
