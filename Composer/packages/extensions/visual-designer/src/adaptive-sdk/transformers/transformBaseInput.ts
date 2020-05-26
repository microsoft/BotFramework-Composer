// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ObiTypes } from '../../constants/ObiTypes';
import { IndexedNode } from '../models/IndexedNode';

export function transformBaseInput(
  input: any,
  jsonpath: string
): { botAsks: IndexedNode; userAnswers: IndexedNode; invalidPrompt: IndexedNode } {
  return {
    botAsks: new IndexedNode(jsonpath, {
      ...input,
      _type: input.$kind,
      $kind: ObiTypes.BotAsks,
    }),
    userAnswers: new IndexedNode(jsonpath, {
      ...input,
      _type: input.$kind,
      $kind: input.$kind === ObiTypes.ChoiceInput ? ObiTypes.ChoiceInputDetail : ObiTypes.UserAnswers,
    }),
    invalidPrompt: new IndexedNode(jsonpath, {
      ...input,
      _type: input.$kind,
      $kind: ObiTypes.InvalidPromptBrick,
    }),
  };
}
