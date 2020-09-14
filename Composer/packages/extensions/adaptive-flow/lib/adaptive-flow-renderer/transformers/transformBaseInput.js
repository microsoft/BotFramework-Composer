// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __assign } from 'tslib';
import { AdaptiveKinds } from '../constants/AdaptiveKinds';
import { IndexedNode } from '../models/IndexedNode';
export function transformBaseInput(input, jsonpath) {
  return {
    botAsks: new IndexedNode(
      jsonpath,
      __assign(__assign({}, input), { _type: input.$kind, $kind: AdaptiveKinds.BotAsks })
    ),
    userAnswers: new IndexedNode(
      jsonpath,
      __assign(__assign({}, input), {
        _type: input.$kind,
        $kind: input.$kind === AdaptiveKinds.ChoiceInput ? AdaptiveKinds.ChoiceInputDetail : AdaptiveKinds.UserAnswers,
      })
    ),
    invalidPrompt: new IndexedNode(
      jsonpath,
      __assign(__assign({}, input), { _type: input.$kind, $kind: AdaptiveKinds.InvalidPromptBrick })
    ),
  };
}
//# sourceMappingURL=transformBaseInput.js.map
