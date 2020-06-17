// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
import { ObiTypes } from '../constants/ObiTypes';
import { IndexedNode } from '../models/IndexedNode';
export function transformBaseInput(input, jsonpath) {
  return {
    botAsks: new IndexedNode(jsonpath, __assign(__assign({}, input), { _type: input.$kind, $kind: ObiTypes.BotAsks })),
    userAnswers: new IndexedNode(
      jsonpath,
      __assign(__assign({}, input), {
        _type: input.$kind,
        $kind: input.$kind === ObiTypes.ChoiceInput ? ObiTypes.ChoiceInputDetail : ObiTypes.UserAnswers,
      })
    ),
    invalidPrompt: new IndexedNode(
      jsonpath,
      __assign(__assign({}, input), { _type: input.$kind, $kind: ObiTypes.InvalidPromptBrick })
    ),
  };
}
//# sourceMappingURL=transformBaseInput.js.map
