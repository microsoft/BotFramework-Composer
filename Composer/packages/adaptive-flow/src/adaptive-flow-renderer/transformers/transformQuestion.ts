// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AdaptiveKinds } from '../constants/AdaptiveKinds';
import { IndexedNode } from '../models/IndexedNode';
import { QuestionType } from '../widgets/Question/QuestionType';

import { inheritParentProperties } from './inheritParentProperty';

export function transformQuestion(
  input,
  jsonpath: string
): { question: IndexedNode; choices: IndexedNode[]; branches: IndexedNode[] } | null {
  if (!input || typeof input !== 'object') return null;

  const cases = input.cases || [];

  const result = {
    question: new IndexedNode(`${jsonpath}`, {
      ...input,
      $kind: AdaptiveKinds.QuestionDetails,
    }),
    choices: [] as IndexedNode[],
    branches: [] as IndexedNode[],
  };
  switch (input?.type) {
    case QuestionType.choice:
      result.choices = (input?.choices || []).map((choice, index) => {
        const path = `${jsonpath}.choices[${index}]`;
        return new IndexedNode(path, {
          id: path,
          $kind: AdaptiveKinds.QuestionCondition,
          choiceValue: choice.value,
          choiceId: choice.id,
          question: input,
        });
      });
      result.choices.push(
        new IndexedNode(`${jsonpath}.choices`, {
          id: `${jsonpath}.choices`,
          $kind: AdaptiveKinds.QuestionCondition,
          isDefault: true,
          choiceValue: 'default',
          choiceId: 'default',
          question: input,
        })
      );
      break;
    case QuestionType.confirm:
      result.choices = ['true', 'false'].map((caseVal, caseIndex) => {
        const path = `${jsonpath}.cases[${caseIndex}]`;
        return new IndexedNode(path, {
          id: path,
          $kind: AdaptiveKinds.QuestionCondition,
          choiceValue: caseVal,
          choiceId: caseVal,
          question: input,
        });
      });
      break;
    case QuestionType.number:
    case QuestionType.text:
    default:
      break;
  }

  if (!cases || !Array.isArray(cases)) return result;

  result.branches.push(
    ...cases.map((c, index) => {
      const prefix = `${jsonpath}.cases[${index}]`;
      return new IndexedNode(`${prefix}.actions`, {
        $kind: AdaptiveKinds.StepGroup,
        children: c.actions || [],
        header: {
          isDefault: c.isDefault,
          choiceValue: c.value,
          choiceId: c.choiceId || 'default',
          id: prefix,
          question: input,
        },
      });
    })
  );

  inheritParentProperties(input, [result.question, ...result.branches]);
  return result;
}
