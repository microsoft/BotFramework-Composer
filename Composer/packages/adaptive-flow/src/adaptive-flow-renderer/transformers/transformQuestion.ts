// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AdaptiveKinds } from '../constants/AdaptiveKinds';
import { IndexedNode } from '../models/IndexedNode';

import { inheritParentProperties } from './inheritParentProperty';

export function transformQuestion(input, jsonpath: string): { question: IndexedNode; branches: IndexedNode[] } | null {
  if (!input || typeof input !== 'object') return null;

  const cases = input.cases || [];

  const result = {
    question: new IndexedNode(`${jsonpath}`, {
      ...input,
      $kind: AdaptiveKinds.ConditionNode,
    }),
    branches: [] as IndexedNode[],
  };

  if (!cases || !Array.isArray(cases)) return result;

  result.branches.push(
    ...cases.map(({ value, actions }, index) => {
      const prefix = `${jsonpath}.cases[${index}]`;
      return new IndexedNode(`${prefix}.actions`, {
        $kind: AdaptiveKinds.StepGroup,
        children: actions || [],
        header: {
          condition: value,
          id: prefix,
        },
      });
    })
  );

  inheritParentProperties(input, [result.question, ...result.branches]);
  return result;
}
