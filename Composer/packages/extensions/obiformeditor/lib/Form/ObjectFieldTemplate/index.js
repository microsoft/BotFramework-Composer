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
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { getUiOptions } from '@bfcomposer/react-jsonschema-form/lib/utils';
import get from 'lodash/get';
import omit from 'lodash/omit';
import formatMessage from 'format-message';
import { BaseField } from '../fields/BaseField';
import ObjectItem from './ObjectItem';
import NewPropertyModal from './NewPropertyModal';
import './styles.css';
function canExpand(_a) {
  var formData = _a.formData,
    schema = _a.schema,
    uiSchema = _a.uiSchema;
  if (!schema.additionalProperties) {
    return false;
  }
  var expandable = getUiOptions(uiSchema).expandable;
  if (expandable === false) {
    return expandable;
  }
  // if ui:options.expandable was not explicitly set to false, we can add
  // another property if we have not exceeded maxProperties yet
  if (schema.maxProperties !== undefined) {
    return Object.keys(formData).length < schema.maxProperties;
  }
  return true;
}
var ObjectFieldTemplate = function(props) {
  var uiSchema = props.uiSchema;
  var _a = useState(false),
    showModal = _a[0],
    setShowModal = _a[1];
  var _b = useState(''),
    editableProperty = _b[0],
    setEditableProperty = _b[1];
  var handlePropertyEdit = function(newName, newValue) {
    var _a;
    props.onChange(
      __assign(
        __assign({}, omit(props.formData, editableProperty)),
        ((_a = {}), (_a[newName] = newValue || get(props.formData, newName || editableProperty, '')), _a)
      )
    );
    setShowModal(false);
    setEditableProperty('');
  };
  var onEditProperty = function(propName) {
    setEditableProperty(propName);
    setShowModal(true);
  };
  var onDismiss = function() {
    setEditableProperty('');
    setShowModal(false);
  };
  var isHidden = function(property) {
    return uiSchema['ui:hidden'] && Array.isArray(uiSchema['ui:hidden']) && uiSchema['ui:hidden'].includes(property);
  };
  return React.createElement(
    'div',
    { className: 'ObjectFieldTemplate', key: props.idSchema.__id },
    React.createElement(
      BaseField,
      __assign({}, props),
      props.properties
        .filter(function(p) {
          return !isHidden(p.name);
        })
        .map(function(p) {
          return React.createElement(
            ObjectItem,
            __assign({}, p, {
              key: p.name,
              onEdit: function() {
                return onEditProperty(p.name);
              },
              onAdd: function() {
                return setShowModal(true);
              },
              uiSchema: uiSchema,
            })
          );
        }),
      canExpand(props) &&
        React.createElement(
          React.Fragment,
          null,
          React.createElement(
            DefaultButton,
            {
              type: 'button',
              onClick: function() {
                return setShowModal(true);
              },
              styles: { root: { marginTop: '10px' } },
            },
            formatMessage('Add')
          ),
          showModal &&
            React.createElement(NewPropertyModal, {
              onSubmit: handlePropertyEdit,
              onDismiss: onDismiss,
              name: editableProperty,
              schema: props.schema || {},
            })
        )
    )
  );
};
export default ObjectFieldTemplate;
//# sourceMappingURL=index.js.map
