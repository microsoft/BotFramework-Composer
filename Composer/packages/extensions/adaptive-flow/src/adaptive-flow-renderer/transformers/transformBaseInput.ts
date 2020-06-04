// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AdaptiveKinds } from '../constants/AdaptiveKinds';
import { IndexedNode } from '../models/IndexedNode';

export function transformBaseInput(
  input: any,
  jsonpath: string
): { botAsks: IndexedNode; userAnswers: IndexedNode; invalidPrompt: IndexedNode } {
  return {
    botAsks: new IndexedNode(jsonpath, {
      ...input,
      _type: input.$kind,
      $kind: AdaptiveKinds.BotAsks,
    }),
    userAnswers: new IndexedNode(jsonpath, {
      ...input,
      _type: input.$kind,
      $kind: input.$kind === AdaptiveKinds.ChoiceInput ? AdaptiveKinds.ChoiceInputDetail : AdaptiveKinds.UserAnswers,
    }),
    invalidPrompt: new IndexedNode(jsonpath, {
      ...input,
      _type: input.$kind,
      $kind: AdaptiveKinds.InvalidPromptBrick,
    }),
  };
}
