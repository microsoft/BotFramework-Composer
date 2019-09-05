import { ObiTypes } from '../constants/ObiTypes';
import { IndexedNode } from '../models/IndexedNode';

export function transformBaseInput(input: any, jsonpath: string): { botAsks: IndexedNode; userAnswers: IndexedNode } {
  return {
    botAsks: new IndexedNode(jsonpath, {
      ...input,
      $type: ObiTypes.BotAsks,
    }),
    userAnswers: new IndexedNode(jsonpath, {
      ...input,
      $type: input.$type === ObiTypes.ChoiceInput ? ObiTypes.ChoiceInputDetail : ObiTypes.UserAnswers,
    }),
  };
}
