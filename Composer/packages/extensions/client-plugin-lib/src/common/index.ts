import { ComposerGlobalName } from './constants';

/** Renders a react component within a Composer plugin surface. */
export function render(component: React.ReactElement) {
  window[ComposerGlobalName].render(component);
}

function fetchProxy(url: string, options: RequestInit) {
  return fetch(`/api/plugins/proxy/${encodeURIComponent(url)}`, {
    method: 'POST',
    body: JSON.stringify(options),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export { fetchProxy as fetch };
