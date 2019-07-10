export const ObiTypes = {
  // dialogs
  AdaptiveDialog: 'Microsoft.AdaptiveDialog',

  // recognizers
  RegexRecognizer: 'Microsoft.RegexRecognizer',
  LuisRecognizer: 'Microsoft.LuisRecognizer',
  MultiLanguageRecognizer: 'Microsoft.MultiLanguageRecognizer',
  QnARecognizer: 'Microsoft.QnARecognizer',

  // rules
  RuleGroup: 'Microsoft.RuleGroup',
  UnknownIntentRule: 'Microsoft.UnknownIntentRule',
  IntentRule: 'Microsoft.IntentRule',
  EventRule: 'Microsoft.EventRule',

  // steps
  BeginDialog: 'Microsoft.BeginDialog',
  SendActivity: 'Microsoft.SendActivity',

  InitProperty: 'Microsoft.InitProperty',
  SetProperty: 'Microsoft.SetProperty',
  EditArray: 'Microsoft.EditArray',
  SaveEntity: 'Microsoft.SaveEntity',
  DeleteProperty: 'Microsoft.DeleteProperty',

  IfCondition: 'Microsoft.IfCondition',
  SwitchCondition: 'Microsoft.SwitchCondition',

  Foreach: 'Microsoft.Foreach',
  ForeachPage: 'Microsoft.ForeachPage',

  TextInput: 'Microsoft.TextInput',
  NumberInput: 'Microsoft.NumberInput',
  IntegerInput: 'Microsoft.IntegerInput',
  FloatInput: 'Microsoft.FloatInput',
  ConfirmInput: 'Microsoft.ConfirmInput',
  ChoiceInput: 'Microsoft.ChoiceInput',

  EndDialog: 'Microsoft.EndDialog',
  CancelAllDialogs: 'Microsoft.CancelAllDialogs',
  ReplaceDialog: 'Microsoft.ReplaceDialog',
  RepeatDialog: 'Microsoft.RepeatDialog',
  EndTurn: 'Microsoft.EndTurn',

  EmitEvent: 'Microsoft.EmitEvent',

  HttpRequest: 'Microsoft.HttpRequest',
  CodeStep: 'Microsoft.CodeStep',

  LogStep: 'Microsoft.LogStep',
  TraceActivity: 'Microsoft.TraceActivity',

  // virtual
  StepGroup: 'VisualSDK.StepGroup',
  ChoiceDiamond: 'VisualSDK.ChoiceDiamond',
  ConditionNode: 'VisualSDK.ConditionNode',
  LoopIndicator: 'VisualSDK.LoopIndicator',
  ForeachDetail: 'VisualSDK.ForeachDetail',
  ForeachPageDetail: 'VisualSDK.ForeachPageDetail',
};
