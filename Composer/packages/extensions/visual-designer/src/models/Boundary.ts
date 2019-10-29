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
 * Describe a rectangle's boundary and its connection point.
 *
 *                    (0, axisX)
 *                    ---o------
 *                    |         |
 *        (0, axisY)  o         o (width, axisY)
 *                    |         |
 *                    ---o-------
 *                 (height, axisX)
 */
export class Boundary {
  width = 0;
  height = 0;
  axisX = 0;
  axisY = 0;

  constructor(width = 0, height = 0) {
    this.width = width;
    this.height = height;
    this.axisX = this.width / 2;
    this.axisY = this.height / 2;
  }
}

export function areBoundariesEqual(a, b) {
  return a.width === b.width && a.height === b.height && a.axisX === b.axisX && a.axisY === b.axisY;
}
