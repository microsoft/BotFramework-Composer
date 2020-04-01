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
import startCase from 'lodash/startCase';
import get from 'lodash/get';
import React from 'react';
import { FontClassNames, FontWeights } from '@uifabric/styling';
import classnames from 'classnames';
import { FontSizes } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { EditableField } from './EditableField';
var overrideDefaults = {
  title: undefined,
  description: undefined,
  helpLink: undefined,
  helpLinkText: undefined,
  helpLinkLabel: undefined,
};
export var RootField = function(props) {
  var title = props.title,
    name = props.name,
    description = props.description,
    schema = props.schema,
    formData = props.formData,
    formContext = props.formContext,
    _a = props.showMetadata,
    showMetadata = _a === void 0 ? false : _a;
  var currentDialog = formContext.currentDialog,
    editorSchema = formContext.editorSchema,
    isRoot = formContext.isRoot;
  var sdkOverrides = get(editorSchema, ['content', 'SDKOverrides', formData.$type], overrideDefaults);
  var handleTitleChange = function(e, newTitle) {
    if (props.onChange) {
      props.onChange(
        __assign(__assign({}, formData), { $designer: __assign(__assign({}, formData.$designer), { name: newTitle }) })
      );
    }
  };
  var getTitle = function() {
    var dialogName = isRoot && currentDialog.displayName;
    var designerName = formData && formData.$designer && formData.$designer.name;
    return designerName || dialogName || sdkOverrides.title || title || schema.title || startCase(name);
  };
  var getSubTitle = function() {
    return sdkOverrides.subtitle || sdkOverrides.title || formData.$type;
  };
  var getDescription = function() {
    return sdkOverrides.description || description || schema.description || '';
  };
  return React.createElement(
    'div',
    { id: props.id, className: 'RootField' },
    React.createElement(
      'div',
      { className: 'RootFieldTitle' },
      React.createElement(EditableField, {
        value: getTitle(),
        onChange: handleTitleChange,
        styles: { field: { fontWeight: FontWeights.semibold }, root: { margin: '5px 0 7px -9px' } },
        fontSize: FontSizes.size20,
        ariaLabel: formatMessage('Title'),
      }),
      React.createElement('p', { className: classnames('RootFieldSubtitle', FontClassNames.smallPlus) }, getSubTitle()),
      sdkOverrides.description !== false &&
        (description || schema.description) &&
        React.createElement(
          'p',
          { className: classnames('RootFieldDescription', FontClassNames.smallPlus) },
          getDescription(),
          sdkOverrides.helpLink &&
            sdkOverrides.helpLinkText &&
            sdkOverrides.helpLinkLabel &&
            React.createElement(
              React.Fragment,
              null,
              React.createElement('br', null),
              React.createElement('br', null),
              React.createElement(
                'a',
                {
                  'aria-label': sdkOverrides.helpLinkLabel,
                  href: sdkOverrides.helpLink,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                },
                sdkOverrides.helpLinkText
              )
            )
        )
    ),
    props.children,
    showMetadata &&
      React.createElement(
        'div',
        { className: 'RootFieldMetaData' },
        React.createElement(
          'div',
          { style: { marginRight: '36px' } },
          React.createElement(
            'span',
            { style: { marginRight: '8px', fontWeight: FontWeights.semibold } },
            formatMessage('ID number')
          ),
          React.createElement(
            'span',
            { style: { minWidth: '75px', display: 'inline-block' } },
            get(formData, '$designer.id')
          )
        )
      )
  );
};
//# sourceMappingURL=RootField.js.map
