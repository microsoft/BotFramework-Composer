// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __extends =
  (this && this.__extends) ||
  (function() {
    var extendStatics = function(d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function(d, b) {
            d.__proto__ = b;
          }) ||
        function(d, b) {
          for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function(d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
import React from 'react';
import debounce from 'lodash/debounce';
import formatMessage from 'format-message';
import { LuEditor } from '@bfc/code-editor';
import { filterSectionDiagnostics } from '@bfc/indexers';
import { WidgetLabel } from './WidgetLabel';
var LuEditorWidget = /** @class */ (function(_super) {
  __extends(LuEditorWidget, _super);
  function LuEditorWidget(props) {
    var _this = _super.call(this, props) || this;
    _this.state = { localValue: '' };
    _this.updateLuIntent = function(body) {
      _this.formContext.shellApi
        .updateLuIntent(_this.luFileId, _this.name, { Name: _this.name, Body: body })
        .catch(function() {});
    };
    _this.onChange = function(body) {
      _this.setState({
        localValue: body,
      });
      if (_this.luFileId) {
        if (body) {
          _this.debounceUpdate(body);
        } else {
          _this.formContext.shellApi.removeLuIntent(_this.luFileId, _this.name);
        }
      }
    };
    _this.debounceUpdate = debounce(_this.updateLuIntent, 500);
    _this.name = _this.props.name;
    _this.formContext = _this.props.formContext;
    _this.luFileId = _this.formContext.currentDialog.luFile + '.' + _this.formContext.locale;
    _this.luFile = _this.formContext.luFiles.find(function(f) {
      return f.id === _this.luFileId;
    });
    _this.luIntent = (_this.luFile &&
      _this.luFile.intents.find(function(intent) {
        return intent.Name === _this.name;
      })) || {
      Name: _this.name,
      Body: '',
    };
    return _this;
  }
  LuEditorWidget.getDerivedStateFromProps = function(nextProps, prevState) {
    var name = nextProps.name;
    var formContext = nextProps.formContext;
    var luFileId = formContext.currentDialog.id + '.' + formContext.locale;
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
    if (!prevState.localValue) {
      return {
        localValue: luIntent.Body,
      };
    }
    return null;
  };
  LuEditorWidget.prototype.render = function() {
    var _a;
    var _b = this.props.height,
      height = _b === void 0 ? 250 : _b;
    var _c = this,
      luFile = _c.luFile,
      luFileId = _c.luFileId,
      luIntent = _c.luIntent,
      name = _c.name,
      formContext = _c.formContext;
    var diagnostics = luFile ? filterSectionDiagnostics(luFile.diagnostics, luIntent) : [];
    var label = prompt
      ? formatMessage('Expected responses (intent: {name})', { name: name })
      : formatMessage('Trigger phrases (intent: {name})', { name: name });
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(WidgetLabel, { label: label }),
      React.createElement(LuEditor, {
        onChange: this.onChange,
        value: this.state.localValue,
        diagnostics: diagnostics,
        hidePlaceholder: true,
        luOption: {
          projectId: formContext.projectId,
          fileId: luFileId,
          sectionId: (_a = luIntent) === null || _a === void 0 ? void 0 : _a.Name,
        },
        options: {
          lineNumbers: 'off',
          minimap: {
            enabled: false,
          },
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 0,
          glyphMargin: false,
          folding: false,
          renderLineHighlight: 'none',
        },
        height: height,
      })
    );
  };
  return LuEditorWidget;
})(React.Component);
export { LuEditorWidget };
//# sourceMappingURL=LuEditorWidget.js.map
