// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { parseDeepLinkUrl } from '../../src/utility/url';

describe('Parse URL', () => {
  it('should parse the url for open API', () => {
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

  it('should return correct url for create API', () => {
    const testString =
      'bfcomposer://create/template/EchoBot?schemaUrl%3Dhttps%3A%2F%2Fraw.githubusercontent.com%2Fmicrosoft%2Fbotframework-sdk%2Fmaster%2Fschemas%2Fcomponent%2Fcomponent.schema%26description%3DHello%20desc';
    const urlToNavigate = parseDeepLinkUrl(testString);
    expect(urlToNavigate).toBe(
      'home/create/template/EchoBot?schemaUrl%3Dhttps%3A%2F%2Fraw.githubusercontent.com%2Fmicrosoft%2Fbotframework-sdk%2Fmaster%2Fschemas%2Fcomponent%2Fcomponent.schema%26description%3DHello%20desc'
    );
  });
});
