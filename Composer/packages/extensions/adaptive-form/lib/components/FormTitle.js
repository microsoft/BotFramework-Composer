'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.styles = void 0;
var tslib_1 = require('tslib');
/** @jsx jsx */
var core_1 = require('@emotion/core');
var react_1 = tslib_1.__importStar(require('react'));
var styling_1 = require('@uifabric/styling');
var fluent_theme_1 = require('@uifabric/fluent-theme');
var format_message_1 = tslib_1.__importDefault(require('format-message'));
var extension_1 = require('@bfc/extension');
var core_2 = require('@emotion/core');
var shared_1 = require('@bfc/shared');
var debounce_1 = tslib_1.__importDefault(require('lodash/debounce'));
var EditableField_1 = require('./fields/EditableField');
var Link_1 = require('./Link');
exports.styles = {
  container: core_2.css(
    templateObject_1 ||
      (templateObject_1 = tslib_1.__makeTemplateObject(
        ['\n    border-bottom: 1px solid #c8c6c4;\n    padding: 0 18px;\n    margin-bottom: 0px;\n  '],
        ['\n    border-bottom: 1px solid #c8c6c4;\n    padding: 0 18px;\n    margin-bottom: 0px;\n  ']
      ))
  ),
  subtitle: core_2.css(
    templateObject_2 ||
      (templateObject_2 = tslib_1.__makeTemplateObject(
        [
          '\n    height: 15px;\n    line-height: 15px;\n    font-size: 12px;\n    font-weight: 600;\n    color: #4f4f4f;\n    margin: -7px 0 7px;\n  ',
        ],
        [
          '\n    height: 15px;\n    line-height: 15px;\n    font-size: 12px;\n    font-weight: 600;\n    color: #4f4f4f;\n    margin: -7px 0 7px;\n  ',
        ]
      ))
  ),
  description: core_2.css(
    templateObject_3 ||
      (templateObject_3 = tslib_1.__makeTemplateObject(
        ['\n    margin-top: 0;\n    margin-bottom: 10px;\n    white-space: pre-line;\n    font-size: ', ';\n  '],
        ['\n    margin-top: 0;\n    margin-bottom: 10px;\n    white-space: pre-line;\n    font-size: ', ';\n  ']
      )),
    fluent_theme_1.FontSizes.size12
  ),
};
var FormTitle = function (props) {
  var _a;
  var description = props.description,
    schema = props.schema,
    formData = props.formData,
    _b = props.uiOptions,
    uiOptions = _b === void 0 ? {} : _b;
  var _c = extension_1.useShellApi(),
    shellApi = _c.shellApi,
    shellData = tslib_1.__rest(_c, ['shellApi']);
  var currentDialog = shellData.currentDialog;
  var recognizers = extension_1.useRecognizerConfig();
  var selectedRecognizer = recognizers.find(function (r) {
    var _a;
    return r.isSelected(
      (_a = currentDialog === null || currentDialog === void 0 ? void 0 : currentDialog.content) === null ||
        _a === void 0
        ? void 0
        : _a.recognizer
    );
  });
  // use a ref because the syncIntentName is debounced and we need the most current version to invoke the api
  var shell = react_1.useRef({
    data: shellData,
    api: shellApi,
  });
  shell.current = {
    data: shellData,
    api: shellApi,
  };
  var syncIntentName = react_1.useMemo(function () {
    return debounce_1.default(function (newIntentName, data) {
      return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var normalizedIntentName;
        return tslib_1.__generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!(newIntentName && selectedRecognizer)) return [3 /*break*/, 2];
              normalizedIntentName =
                newIntentName === null || newIntentName === void 0
                  ? void 0
                  : newIntentName.replace(/[^a-zA-Z0-9-_]+/g, '');
              return [
                4 /*yield*/,
                selectedRecognizer.renameIntent(
                  data === null || data === void 0 ? void 0 : data.intent,
                  normalizedIntentName,
                  shell.current.data,
                  shell.current.api
                ),
              ];
            case 1:
              _a.sent();
              _a.label = 2;
            case 2:
              return [2 /*return*/];
          }
        });
      });
    }, 400);
  }, []);
  var handleTitleChange = function (newTitle) {
    if (formData.$kind === shared_1.SDKKinds.OnIntent) {
      syncIntentName(newTitle, formData);
    }
    props.onChange({
      $designer: tslib_1.__assign(tslib_1.__assign({}, formData.$designer), { name: newTitle }),
    });
  };
  var uiLabel =
    typeof (uiOptions === null || uiOptions === void 0 ? void 0 : uiOptions.label) === 'function'
      ? uiOptions.label(formData)
      : uiOptions.label;
  var uiSubtitle =
    typeof (uiOptions === null || uiOptions === void 0 ? void 0 : uiOptions.subtitle) === 'function'
      ? uiOptions.subtitle(formData)
      : uiOptions.subtitle;
  var initialValue = react_1.useMemo(
    function () {
      var _a;
      var designerName = (_a = formData.$designer) === null || _a === void 0 ? void 0 : _a.name;
      return designerName || uiLabel || schema.title;
    },
    [(_a = formData.$designer) === null || _a === void 0 ? void 0 : _a.name, uiLabel, schema.title]
  );
  var getHelpLinkLabel = function () {
    return (uiLabel || schema.title || '').toLowerCase();
  };
  var getSubTitle = function () {
    return uiSubtitle || uiLabel || formData.$kind;
  };
  var getDescription = function () {
    var descriptionOverride = uiOptions.description;
    if (descriptionOverride) {
      if (typeof descriptionOverride === 'function') {
        var result = descriptionOverride(formData);
        if (result) {
          return result;
        }
      } else {
        return descriptionOverride;
      }
    }
    return description || schema.description || '';
  };
  return uiLabel !== false
    ? core_1.jsx(
        'div',
        { css: exports.styles.container, id: props.id },
        core_1.jsx(
          'div',
          null,
          core_1.jsx(EditableField_1.EditableField, {
            ariaLabel: format_message_1.default('form title'),
            depth: 0,
            fontSize: fluent_theme_1.FontSizes.size20,
            id: 'form-title',
            name: '$designer.name',
            schema: {},
            styles: {
              field: { fontWeight: styling_1.FontWeights.semibold },
              root: { margin: '5px 0 7px -9px' },
            },
            uiOptions: {},
            value: initialValue,
            onChange: handleTitleChange,
          }),
          core_1.jsx('p', { css: exports.styles.subtitle }, getSubTitle()),
          core_1.jsx(
            'p',
            { css: exports.styles.description },
            getDescription(),
            (uiOptions === null || uiOptions === void 0 ? void 0 : uiOptions.helpLink) &&
              core_1.jsx(
                react_1.default.Fragment,
                null,
                core_1.jsx('br', null),
                core_1.jsx('br', null),
                core_1.jsx(
                  Link_1.Link,
                  {
                    'aria-label': format_message_1.default('Learn more about {title}', { title: getHelpLinkLabel() }),
                    href: uiOptions === null || uiOptions === void 0 ? void 0 : uiOptions.helpLink,
                    rel: 'noopener noreferrer',
                    target: '_blank',
                  },
                  format_message_1.default('Learn more')
                )
              )
          )
        ),
        props.children
      )
    : null;
};
exports.default = FormTitle;
var templateObject_1, templateObject_2, templateObject_3;
//# sourceMappingURL=FormTitle.js.map
