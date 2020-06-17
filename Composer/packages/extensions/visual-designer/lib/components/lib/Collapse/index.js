// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import {
  collapseContainer,
  collapseHeader,
  headerText,
  headerIcon,
  headerButton,
  collapseContent,
} from './CollapseStyles';
export var Collapse = function (_a) {
  var text = _a.text,
    children = _a.children;
  var _b = useState(false),
    collapsed = _b[0],
    setCollapsed = _b[1];
  var collapseFuc = function (e) {
    e.stopPropagation();
    setCollapsed(!collapsed);
  };
  return jsx(
    'div',
    { className: 'collapse', css: collapseContainer },
    jsx(
      'div',
      { className: 'collapse__topbar', css: collapseHeader },
      jsx('div', { className: 'collapse__header', css: headerText }, text),
      jsx('div', { className: 'collapse__line', css: headerIcon }),
      jsx(IconButton, { css: headerButton(collapsed), iconProps: { iconName: 'PageRight' }, onClick: collapseFuc })
    ),
    jsx('div', { className: 'collapse__content', css: collapseContent(collapsed) }, children)
  );
};
//# sourceMappingURL=index.js.map
