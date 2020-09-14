'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
const constants_1 = require('./constants');
/** Renders a react component within a Composer plugin surface. */
function render(component) {
  window[constants_1.ComposerGlobalName].render(component);
}
exports.render = render;
/** Allows plugin client bundles to make AJAX calls from the server -- avoiding the issue of CORS */
function fetchProxy(url, options) {
  return fetch(`/api/plugins/proxy/${encodeURIComponent(url)}`, {
    method: 'POST',
    body: JSON.stringify(options),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
exports.fetch = fetchProxy;
//# sourceMappingURL=index.js.map
