/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import { FileSettingManager } from '../../../src/models/settings/fileSettingManager';
import { Path } from '../../../src/utility/path';

const dir = './mocks';
const defaultDir = Path.join(__dirname, dir);

describe('get', () => {
  it('return values', async () => {
    const sm = new FileSettingManager(defaultDir);
    const result = await sm.get('', false);
    expect(result.label).toBe('default');
  });

  it('return obfuscated alues', async () => {
    const sm = new FileSettingManager(defaultDir);
    const result = await sm.get('', true);
    expect(result.label).toBe('*****');
    expect(result.mock1).toBe('*****');
    expect(result.mock2).toBe('*****');
    expect(result.mock3.mock3).toBe('*****');
    expect(result.mock3.mock4).toBe('*****');
    expect(result.mock3.mock5[0]).toBe('*****');
    expect(result.mock3.mock5[1]).toBe('*****');
  });

  it('return slot values', async () => {
    const sm = new FileSettingManager(defaultDir);
    const result = await sm.get('integration', false);
    expect(result.label).toBe('integration');
    const result2 = await sm.get('production', false);
    expect(result2.label).toBe('production');
    const result3 = await sm.get('bonus', false);
    expect(result3.label).toBe('bonus');
  });
});
