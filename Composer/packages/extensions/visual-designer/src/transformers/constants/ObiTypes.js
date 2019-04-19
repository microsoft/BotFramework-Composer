export const ObiTypes = {
  // dialogs
  ObiRuleDialog: 'Microsoft.RuleDialog',
  SequenceDialog: 'Microsoft.SequenceDialog',
  AdaptiveDialog: 'Microsoft.AdaptiveDialog',

  // recognizers
  RegexRecognizer: 'Microsoft.RegexRecognizer',
  LuisRecognizer: 'Microsoft.LuisRecognizer',
  MultiLanguageRecognizer: 'Microsoft.MultiLanguageRecognizer',
  QnARecognizer: 'Microsoft.QnARecognizer',

  // rules
  WelcomeRule: 'Microsoft.WelcomeRule',
  NoMatchRule: 'Microsoft.NoMatchRule',
  IntentRule: 'Microsoft.IntentRule',
  EventRule: 'Microsoft.EventRule',

  // steps
  BeginDialog: 'Microsoft.BeginDialog',
  SendActivity: 'Microsoft.SendActivity',
  EditArray: 'Microsoft.EditArray',
  SaveEntity: 'Microsoft.SaveEntity',
  DeleteProperty: 'Microsoft.DeleteProperty',
  IfCondition: 'Microsoft.IfCondition',
  TextInput: 'Microsoft.TextInput',

  // virtual types
  IntentGroup: 'VisualEditor.IntentGroup',
  EventGroup: 'VisualEditor.EventGroup',
  RuleGroup: 'VisualEditor.RuleGroup',
  StepGroup: 'VisualEditor.StepGroup',
};
