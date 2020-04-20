// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { parseDeepLinkUrl } from '../../src/utility/url';

describe('Parse URL', () => {
  it('should parse the url to navigate', () => {
    const testString =
      'bfcomposer://open?url=bot%2F88524.65932484581%2Fdialogs%2Fdeleteitem%3Fselected%3Dtriggers%5B0%5D%26focused%3Dtriggers%5B0%5D.actions%5B0%5D&test=ab';
    const urlToNavigate = parseDeepLinkUrl(testString);
    expect(urlToNavigate).toBe(
      'bot/88524.65932484581/dialogs/deleteitem?selected=triggers[0]&focused=triggers[0].actions[0]'
    );
  });

  it('should return empty ', () => {
    const testString =
      'bfcomposer://noop?url=http%3A%2F%2Flocalhost%3A5000%2Fbot%2F88524.65932484581%2Fdialogs%2Fdeleteitem%3Fselected%3Dtriggers%5B0%5D%26focused%3Dtriggers%5B0%5D.actions%5B0%5D&test=ab';
    const urlToNavigate = parseDeepLinkUrl(testString);
    expect(urlToNavigate).toBe('');
  });
});
