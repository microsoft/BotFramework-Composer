/**
 * Usage requires URL to conform www.botdesigner.com/#/{Key0}/{value0}...
 * e.g. www.botdesigner.com/#/intent/4c6f7ea5-a79a-48c5-ade0-7553c95a880d
 */
export function getResourceValueFromUrl(resourceKey: string): string | undefined {
  const urlTokens = window.location.hash
    .substring(1)
    .toLowerCase()
    .split('/');
  const lowerCaseResourceKey = resourceKey.toLowerCase();

  for (let i = 0; i < urlTokens.length; i++) {
    if (urlTokens[i] === lowerCaseResourceKey && !!urlTokens[i + 1]) {
      return urlTokens[i + 1];
    }
  }

  return undefined;
}

export function isDebugMode(): boolean {
  return getResourceValueFromUrl('mode') === 'debug';
}
