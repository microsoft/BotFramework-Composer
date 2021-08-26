// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum QuestionType {
  choice = 'choice',
  text = 'text',
  confirm = 'confirm',
  number = 'number',
}

export const isBranchingQuestionType = (questionType: any) => {
  return questionType === QuestionType.choice || questionType === QuestionType.confirm;
};

export const actionGroupIsOpened = (actions: any): boolean => {
  if (!Array.isArray(actions) || !actions.length) return false;

  const lastAction = actions[actions.length - 1];
  if (lastAction.$kind === 'Microsoft.VirtualAgents.Question') {
    return isBranchingQuestionType(lastAction.type);
  }
  return false;
};
