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
/**
 * visitor function used by JsonWalk
 * @param path jsonPath string
 * @param value current node value
 * @return boolean, true to stop walk deep
 */
export interface VisitorFunc {
  (path: string, value: any): boolean;
}

/**
 *
 * @param path jsonPath string
 * @param value current node value
 * @param visitor
 */

export const JsonWalk = (path: string, value: any, visitor: VisitorFunc) => {
  const stop = visitor(path, value);
  if (stop === true) return;

  // extract array
  if (Array.isArray(value)) {
    value.forEach((child, index) => {
      JsonWalk(`${path}[:${index}]`, child, visitor);
    });

    // extract object
  } else if (typeof value === 'object' && value) {
    Object.keys(value).forEach(key => {
      JsonWalk(`${path}.${key}`, value[key], visitor);
    });
  }
};
