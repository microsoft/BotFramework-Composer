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
import { ObiFieldNames } from '../constants/ObiFieldNames';
import { ObiTypes } from '../constants/ObiTypes';
import { IndexedNode } from '../models/IndexedNode';

const ConditionKey = ObiFieldNames.Condition;
const CasesKey = ObiFieldNames.Cases;
const CaseStepKey = ObiFieldNames.Actions;
const DefaultBranchKey = ObiFieldNames.DefaultCase;

export function transformSwitchCondition(
  input,
  jsonpath: string
): { condition: IndexedNode; choice: IndexedNode; branches: IndexedNode[] } | null {
  if (!input || input.$type !== ObiTypes.SwitchCondition) return null;

  const condition = input[ConditionKey] || '';
  const defaultSteps = input[DefaultBranchKey] || [];
  const cases = input[CasesKey] || [];

  const result = {
    condition: new IndexedNode(`${jsonpath}`, {
      ...input,
      $type: ObiTypes.ConditionNode,
    }),
    choice: new IndexedNode(`${jsonpath}`, {
      $type: ObiTypes.ChoiceDiamond,
      text: condition,
    }),
    branches: [] as IndexedNode[],
  };

  result.branches.push(
    new IndexedNode(`${jsonpath}.${DefaultBranchKey}`, {
      $type: ObiTypes.StepGroup,
      label: DefaultBranchKey,
      children: defaultSteps,
    })
  );

  if (!cases || !Array.isArray(cases)) return result;

  result.branches.push(
    ...cases.map(({ value, actions }, index) => {
      const prefix = `${jsonpath}.${CasesKey}[${index}]`;
      return new IndexedNode(`${prefix}.${CaseStepKey}`, {
        $type: ObiTypes.StepGroup,
        label: value,
        children: actions || [],
      });
    })
  );
  return result;
}
