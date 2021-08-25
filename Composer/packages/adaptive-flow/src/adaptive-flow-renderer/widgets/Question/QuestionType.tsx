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
