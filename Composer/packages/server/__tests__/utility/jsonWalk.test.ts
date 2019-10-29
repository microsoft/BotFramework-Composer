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
import { JsonWalk, VisitorFunc } from '../../../server/src/utility/jsonWalk';

const data = {
  firstName: 'John',
  lastName: 'doe',
  age: 26,
  address: {
    streetAddress: 'naist street',
    city: 'Nara',
    postalCode: '630-0192',
  },
  phoneNumbers: [
    {
      type: 'iPhone',
      number: '0123-4567-8888',
    },
    {
      type: 'home',
      number: '0123-4567-8910',
    },
  ],
};

describe('run json walk', () => {
  it('visitor should walk through every node', () => {
    const visitedPath: string[] = [];
    const visitor: VisitorFunc = (path: string, _value: any) => {
      visitedPath.push(path);
      return false;
    };
    JsonWalk('$', data, visitor);
    const lastPath = visitedPath.pop();
    expect(visitedPath.length).toBe(14);
    expect(lastPath).toBe('$.phoneNumbers[:1].number');
  });

  it('if visitor stop, its children should not be visited', () => {
    const visitedPath: string[] = [];
    const visitor: VisitorFunc = (path: string, _value: any) => {
      // jump over phoneNumbers
      if (/phoneNumbers/.exec(path)) {
        return true;
      }
      visitedPath.push(path);
      return false;
    };
    JsonWalk('$', data, visitor);
    expect(visitedPath.length).toBe(8);
    expect(visitedPath.indexOf('$.phoneNumbers[:1].number')).toBe(-1);
  });
});
