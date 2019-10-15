import { SDKTypes } from 'shared';

export const ObiTypes = {
  ...SDKTypes,

  // TODO: are they outdated?
  CodeStep: 'Microsoft.CodeStep',
  QnARecognizer: 'Microsoft.QnARecognizer',
  SaveEntity: 'Microsoft.SaveEntity',

  // virtual
  RuleGroup: 'VisualSDK.RuleGroup',
  StepGroup: 'VisualSDK.StepGroup',
  ChoiceDiamond: 'VisualSDK.ChoiceDiamond',
  ConditionNode: 'VisualSDK.ConditionNode',
  LoopIndicator: 'VisualSDK.LoopIndicator',
  ForeachDetail: 'VisualSDK.ForeachDetail',
  ForeachPageDetail: 'VisualSDK.ForeachPageDetail',
  BotAsks: 'VisualSDK.BotAsks',
  UserAnswers: 'VisualSDK.UserAnswers',
  InvalidPromptBrick: 'VisualSDK.InvalidPromptBrick',
  ChoiceInputDetail: 'VisualSDK.ChoiceInputDetail',
};
