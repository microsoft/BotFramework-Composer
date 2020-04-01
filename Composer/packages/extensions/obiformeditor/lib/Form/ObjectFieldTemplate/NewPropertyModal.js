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
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import get from 'lodash/get';
import Modal from '../../Modal';
var NAME_PATTERN = /^\S+$/;
function validateName(name) {
  if (!name || name.trim().length === 0) {
    return formatMessage("Name can't be blank");
  }
  if (!NAME_PATTERN.test(name)) {
    return formatMessage("Name can't contain any spaces");
  }
  return null;
}
function getDefaultValue(schema) {
  switch (get(schema, 'additionalProperties.type')) {
    case 'object':
      return {};
    case 'array':
      return [];
    default:
      return '';
  }
}
var NewPropertyModal = function(props) {
  var onDismiss = props.onDismiss,
    onSubmit = props.onSubmit,
    name = props.name,
    schema = props.schema;
  var _a = useState({ name: name }),
    formData = _a[0],
    setFormData = _a[1];
  var updateForm = function(_, newValue) {
    setFormData({ error: undefined, name: newValue });
  };
  var handleSubmit = function(e) {
    e.preventDefault();
    var nameError = validateName(formData.name);
    if (nameError) {
      setFormData(__assign(__assign({}, formData), { error: nameError }));
      return;
    }
    onSubmit(formData.name, getDefaultValue(schema));
  };
  return React.createElement(
    Modal,
    { onDismiss: onDismiss },
    React.createElement(
      'form',
      { onSubmit: handleSubmit },
      React.createElement(TextField, {
        description: get(schema, 'propertyNames.description'),
        label: get(schema, 'propertyNames.title') || formatMessage('Name'),
        onChange: updateForm,
        required: true,
        errorMessage: formData.error,
        value: formData.name,
        componentRef: function(ref) {
          if (ref) {
            ref.focus();
          }
        },
      }),
      React.createElement(
        PrimaryButton,
        { type: 'submit', primary: true, styles: { root: { width: '100%', marginTop: '20px' } } },
        formatMessage('Add')
      )
    )
  );
};
NewPropertyModal.defaultProps = {
  onDismiss: function() {},
  onSubmit: function() {},
};
export default NewPropertyModal;
//# sourceMappingURL=NewPropertyModal.js.map
