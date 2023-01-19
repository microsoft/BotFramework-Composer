// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ComposerGlobalName } from './constants';

/** Renders a react component within a Composer plugin surface. */
export function render(component: React.ReactElement) {
  window[ComposerGlobalName].render(component);
}

const fetchHeaders = { 'X-CSRF-Token': window['__csrf__'] }

/** Allows extension client bundles to make AJAX calls from the server -- avoiding the issue of CORS */
function fetchProxy(url: string, options: RequestInit) {
  return fetch(`/api/extensions/proxy/${encodeURIComponent(url)}`, {
    method: 'POST',
    body: JSON.stringify(options),
    headers: {
      ...fetchHeaders,
      'Content-Type': 'application/json',
    },
  });
}

export { fetchProxy as fetch };
