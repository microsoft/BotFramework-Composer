// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AdaptiveKinds } from '../constants/AdaptiveKinds';
import { IndexedNode } from '../models/IndexedNode';
import { isBranchingQuestionType, QuestionType } from '../widgets/Question/QuestionType';

import { inheritParentProperties } from './inheritParentProperty';

export function transformQuestion(
  input,
  jsonpath: string
): {
  question: IndexedNode;
  choices: IndexedNode[];
  branches: IndexedNode[];
  convergence: { [choiceIndex: number]: number };
} | null {
  if (!input || typeof input !== 'object') return null;

  const result = {
    question: new IndexedNode(`${jsonpath}`, {
      ...input,
      $kind: AdaptiveKinds.QuestionDetails,
    }),
    choices: [] as IndexedNode[],
    branches: [] as IndexedNode[],
    convergence: {},
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
          gotoChoice: choice.gotoChoice,
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

  const cases = input.cases || [];
  if (!cases || !Array.isArray(cases) || !isBranchingQuestionType(input?.type)) return result;

  result.branches.push(
    ...cases.map((c, index) => {
      const prefix = `${jsonpath}.cases[${index}]`;
      return new IndexedNode(`${prefix}.actions`, {
        $kind: AdaptiveKinds.StepGroup,
        children: c.actions || [],
        choiceId: c.choiceId ?? 'default',
        caseValue: c.value,
      });
    })
  );

  inheritParentProperties(input, [result.question, ...result.branches]);

  // Converge choices and cases (branches) mapping rule
  if (input?.type === QuestionType.choice) {
    result.choices.forEach((node, choiceIndex) => {
      const { gotoChoice } = node.json;
      if (!gotoChoice) return;
      const caseIndex = result.branches.findIndex((caseData) => caseData.json.choiceId === gotoChoice);
      if (caseIndex > -1) result.convergence[choiceIndex] = caseIndex;
    });
  }

  return result;
}
