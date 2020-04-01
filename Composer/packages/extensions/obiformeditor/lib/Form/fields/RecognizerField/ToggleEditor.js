// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState } from 'react';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { FontSizes } from 'office-ui-fabric-react/lib/Styling';
import formatMessage from 'format-message';
export default function ToggleEditor(props) {
  var _a = useState(true),
    showEditor = _a[0],
    setShowEditor = _a[1];
  if (!props.loaded) {
    return null;
  }
  return React.createElement(
    'div',
    { className: 'ToggleEditor' },
    React.createElement(
      Link,
      {
        onClick: function() {
          return setShowEditor(!showEditor);
        },
        styles: { root: { fontSize: FontSizes.smallPlus, marginBottom: '10px' } },
      },
      showEditor
        ? formatMessage('Hide {title}', { title: props.title })
        : formatMessage('View {title}', { title: props.title })
    ),
    React.createElement('div', null, showEditor && props.children())
  );
}
//# sourceMappingURL=ToggleEditor.js.map
