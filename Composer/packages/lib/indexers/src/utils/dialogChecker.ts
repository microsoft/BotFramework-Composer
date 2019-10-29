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
import get from 'lodash.get';
import { ExpressionEngine } from 'botbuilder-expression-parser';

const ExpressionParser = new ExpressionEngine();

interface CheckerFunc {
  (node: { path: string; value: any }): string; // error msg
}

function IsExpression(name: string): CheckerFunc {
  return node => {
    const exp = get(node.value, name);
    if (!exp) return `In ${node.path}: ${node.value.$type}: ${name} is missing or empty`;

    let message = '';
    try {
      ExpressionParser.parse(exp);
    } catch (error) {
      message = `In ${node.path}: ${node.value.$type}: ${name} must be an expression`;
    }
    return message;
  };
}

enum EditArrayChangeTypes {
  Push,
  Pop,
  Take,
  Remove,
  Clear,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EditArrayValueChecker(node: { path: string; value: any }): string {
  let message = '';

  const changeType = get(node.value, 'changeType');

  // when push and remove, value is required
  if (changeType === EditArrayChangeTypes.Push || changeType === EditArrayChangeTypes.Remove) {
    const exp = get(node.value, 'value');
    try {
      ExpressionParser.parse(exp);
    } catch (error) {
      message = `In ${node.path}: ${node.value.$type}: ${name} must be an expression`;
    }
  }

  return message;
}

/**
 * Dialog Validation Rules
 */
// TODO: check field by schema.
export const DialogChecker: { [key: string]: CheckerFunc[] } = {
  'Microsoft.IfCondition': [IsExpression('condition')],
  'Microsoft.SwitchCondition': [IsExpression('condition')],
  'Microsoft.SetProperty': [IsExpression('property'), IsExpression('value')],
  'Microsoft.ForeachPage': [IsExpression('itemsProperty')],
  'Microsoft.Foreach': [IsExpression('itemsProperty')],
  'Microsoft.EditArray': [IsExpression('itemsProperty'), EditArrayValueChecker],
};
