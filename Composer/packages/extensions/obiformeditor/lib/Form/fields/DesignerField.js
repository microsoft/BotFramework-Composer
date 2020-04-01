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
import React, { useEffect } from 'react';
import formatMessage from 'format-message';
import { getDesignerId } from '@bfc/shared';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { NeutralColors } from '@uifabric/fluent-theme';
import get from 'lodash/get';
import './DesignerField.css';
export var DesignerField = function(props) {
  var data = props.data,
    onChange = props.onChange;
  useEffect(
    function() {
      // create new designer metadata
      if (!data || !data.id) {
        var newDesigner = getDesignerId(data);
        onChange(newDesigner);
      }
    },
    [data]
  );
  var update = function(field, val) {
    var _a;
    onChange(__assign(__assign({}, data), ((_a = {}), (_a[field] = val), _a)));
  };
  return React.createElement(
    'div',
    { className: 'DesignerField' },
    React.createElement(
      'div',
      { className: 'DesignerFieldSection' },
      React.createElement(TextField, {
        value: get(data, 'name'),
        placeholder: props.placeholder,
        label: formatMessage('Name'),
        onChange: function(_, val) {
          return update('name', val);
        },
      }),
      React.createElement(TextField, {
        multiline: true,
        autoAdjustHeight: true,
        value: get(data, 'description'),
        label: formatMessage('Description'),
        onChange: function(_, val) {
          return update('description', val);
        },
      })
    ),
    React.createElement(
      'div',
      { className: 'DesignerFieldSection' },
      React.createElement(TextField, {
        value: get(data, 'id'),
        label: formatMessage('ID number'),
        borderless: true,
        readOnly: true,
        styles: { field: { color: NeutralColors.gray140, paddingLeft: 0 } },
      })
    )
  );
};
//# sourceMappingURL=DesignerField.js.map
