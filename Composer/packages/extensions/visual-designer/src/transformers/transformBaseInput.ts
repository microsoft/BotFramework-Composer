import { ObiTypes } from '../constants/ObiTypes';
import { IndexedNode } from '../models/IndexedNode';

export function transformBaseInput(
  input: any,
  jsonpath: string
): { botAsks: IndexedNode; userAnswers: IndexedNode; invalidPrompt: IndexedNode } {
  return {
    botAsks: new IndexedNode(jsonpath, {
      ...input,
      _type: input.$type,
      $type: ObiTypes.BotAsks,
    }),
    userAnswers: new IndexedNode(jsonpath, {
      ...input,
      _type: input.$type,
      $type: input.$type === ObiTypes.ChoiceInput ? ObiTypes.ChoiceInputDetail : ObiTypes.UserAnswers,
    }),
    invalidPrompt: new IndexedNode(jsonpath, {
      ...input,
      _type: input.$type,
      $type: ObiTypes.InvalidPromptBrick,
    }),
  };
}
