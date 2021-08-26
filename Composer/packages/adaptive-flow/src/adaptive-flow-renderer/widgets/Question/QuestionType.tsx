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

export const checkTrailingPVAQuestionAction = (actions: any): boolean => {
  if (!Array.isArray(actions)) return false;
  const lastAction = actions[actions.length - 1];

  return lastAction && lastAction.$kind === 'Microsoft.VirtualAgents.Question';
};
