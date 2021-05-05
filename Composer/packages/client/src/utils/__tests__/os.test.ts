// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { platform, OS } from '../os';

describe('platform', () => {
  it.each([
    [
      OS.Windows,
      '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) @bfc/electron-server/1.4.0-nightly.237625.d1378c6 Chrome/80.0.3987.165 Electron/8.2.4 Safari/537.36',
    ],
    [
      OS.MacOS,
      '5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36 Edg/90.0.818.46',
    ],
    [
      OS.Linux,
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36',
    ],
    [
      OS.Unix,
      'Mozilla/5.0 (X11; CrOS x86_64 13020.67.2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',
    ],
  ])('%s', (expectedOS, userAgentString) => {
    expect(platform(userAgentString)).toBe(expectedOS);
  });
});
