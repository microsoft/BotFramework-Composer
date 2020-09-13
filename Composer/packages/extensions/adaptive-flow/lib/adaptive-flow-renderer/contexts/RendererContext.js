// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
export var DefaultRenderers = {
  EdgeMenu: function () {
    return React.createElement(React.Fragment, null);
  },
  NodeMenu: function () {
    return React.createElement(React.Fragment, null);
  },
  NodeWrapper: function (_a) {
    var children = _a.children;
    return React.createElement(React.Fragment, null, children);
  },
  ElementWrapper: function (_a) {
    var children = _a.children;
    return React.createElement(React.Fragment, null, children);
  },
};
export var RendererContext = React.createContext(DefaultRenderers);
//# sourceMappingURL=RendererContext.js.map
