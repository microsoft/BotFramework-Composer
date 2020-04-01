// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
export var UnsupportedField = function(props) {
  return React.createElement(
    'div',
    null,
    'unsupported field: ',
    '<' + props.fieldName + ' />',
    ' (',
    props.schema.title,
    ')'
  );
};
//# sourceMappingURL=UnsupportedField.js.map
