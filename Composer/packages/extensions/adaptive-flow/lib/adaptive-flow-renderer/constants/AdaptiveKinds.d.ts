import { SDKKinds } from '@bfc/shared';
declare enum VirtualElementTypes {
  RuleGroup = 'VisualSDK.RuleGroup',
  StepGroup = 'VisualSDK.StepGroup',
  ChoiceDiamond = 'VisualSDK.ChoiceDiamond',
  ConditionNode = 'VisualSDK.ConditionNode',
  LoopIndicator = 'VisualSDK.LoopIndicator',
  ForeachDetail = 'VisualSDK.ForeachDetail',
  ForeachPageDetail = 'VisualSDK.ForeachPageDetail',
  BotAsks = 'VisualSDK.BotAsks',
  UserAnswers = 'VisualSDK.UserAnswers',
  InvalidPromptBrick = 'VisualSDK.InvalidPromptBrick',
  ChoiceInputDetail = 'VisualSDK.ChoiceInputDetail',
}
export declare const AdaptiveKinds: {
  RuleGroup: VirtualElementTypes.RuleGroup;
  StepGroup: VirtualElementTypes.StepGroup;
  ChoiceDiamond: VirtualElementTypes.ChoiceDiamond;
  ConditionNode: VirtualElementTypes.ConditionNode;
  LoopIndicator: VirtualElementTypes.LoopIndicator;
  ForeachDetail: VirtualElementTypes.ForeachDetail;
  ForeachPageDetail: VirtualElementTypes.ForeachPageDetail;
  BotAsks: VirtualElementTypes.BotAsks;
  UserAnswers: VirtualElementTypes.UserAnswers;
  InvalidPromptBrick: VirtualElementTypes.InvalidPromptBrick;
  ChoiceInputDetail: VirtualElementTypes.ChoiceInputDetail;
  ActivityTemplate: SDKKinds.ActivityTemplate;
  AdaptiveDialog: SDKKinds.AdaptiveDialog;
  AgeEntityRecognizer: SDKKinds.AgeEntityRecognizer;
  Ask: SDKKinds.Ask;
  AttachmentInput: SDKKinds.AttachmentInput;
  BeginDialog: SDKKinds.BeginDialog;
  BreakLoop: SDKKinds.BreakLoop;
  CancelAllDialogs: SDKKinds.CancelAllDialogs;
  CancelDialog: SDKKinds.CancelDialog;
  ChoiceInput: SDKKinds.ChoiceInput;
  ConditionalSelector: SDKKinds.ConditionalSelector;
  ConfirmInput: SDKKinds.ConfirmInput;
  ConfirmationEntityRecognizer: SDKKinds.ConfirmationEntityRecognizer;
  ContinueLoop: SDKKinds.ContinueLoop;
  CrossTrainedRecognizerSet: SDKKinds.CrossTrainedRecognizerSet;
  CurrencyEntityRecognizer: SDKKinds.CurrencyEntityRecognizer;
  CustomRecognizer: SDKKinds.CustomRecognizer;
  DateTimeEntityRecognizer: SDKKinds.DateTimeEntityRecognizer;
  DateTimeInput: SDKKinds.DateTimeInput;
  DebugBreak: SDKKinds.DebugBreak;
  DeleteActivity: SDKKinds.DeleteActivity;
  DeleteProperties: SDKKinds.DeleteProperties;
  DeleteProperty: SDKKinds.DeleteProperty;
  DimensionEntityRecognizer: SDKKinds.DimensionEntityRecognizer;
  EditActions: SDKKinds.EditActions;
  EditArray: SDKKinds.EditArray;
  EmailEntityRecognizer: SDKKinds.EmailEntityRecognizer;
  EmitEvent: SDKKinds.EmitEvent;
  EndDialog: SDKKinds.EndDialog;
  EndTurn: SDKKinds.EndTurn;
  FirstSelector: SDKKinds.FirstSelector;
  Foreach: SDKKinds.Foreach;
  ForeachPage: SDKKinds.ForeachPage;
  GetActivityMembers: SDKKinds.GetActivityMembers;
  GetConversationMembers: SDKKinds.GetConversationMembers;
  GotoAction: SDKKinds.GotoAction;
  GuidEntityRecognizer: SDKKinds.GuidEntityRecognizer;
  HashtagEntityRecognizer: SDKKinds.HashtagEntityRecognizer;
  HttpRequest: SDKKinds.HttpRequest;
  IActivityTemplate: SDKKinds.IActivityTemplate;
  IDialog: SDKKinds.IDialog;
  IEntityRecognizer: SDKKinds.IEntityRecognizer;
  ILanguageGenerator: SDKKinds.ILanguageGenerator;
  IRecognizer: SDKKinds.IRecognizer;
  ITextTemplate: SDKKinds.ITextTemplate;
  ITrigger: SDKKinds.ITrigger;
  ITriggerSelector: SDKKinds.ITriggerSelector;
  IfCondition: SDKKinds.IfCondition;
  InputDialog: SDKKinds.InputDialog;
  IpEntityRecognizer: SDKKinds.IpEntityRecognizer;
  LanguagePolicy: SDKKinds.LanguagePolicy;
  LogAction: SDKKinds.LogAction;
  LuisRecognizer: SDKKinds.LuisRecognizer;
  MentionEntityRecognizer: SDKKinds.MentionEntityRecognizer;
  MostSpecificSelector: SDKKinds.MostSpecificSelector;
  MultiLanguageRecognizer: SDKKinds.MultiLanguageRecognizer;
  NumberEntityRecognizer: SDKKinds.NumberEntityRecognizer;
  NumberInput: SDKKinds.NumberInput;
  NumberRangeEntityRecognizer: SDKKinds.NumberRangeEntityRecognizer;
  OAuthInput: SDKKinds.OAuthInput;
  OnActivity: SDKKinds.OnActivity;
  OnAssignEntity: SDKKinds.OnAssignEntity;
  OnBeginDialog: SDKKinds.OnBeginDialog;
  OnCancelDialog: SDKKinds.OnCancelDialog;
  OnChooseEntity: SDKKinds.OnChooseEntity;
  OnChooseIntent: SDKKinds.OnChooseIntent;
  OnChooseProperty: SDKKinds.OnChooseProperty;
  OnCondition: SDKKinds.OnCondition;
  OnConversationUpdateActivity: SDKKinds.OnConversationUpdateActivity;
  OnDialogEvent: SDKKinds.OnDialogEvent;
  OnEndOfActions: SDKKinds.OnEndOfActions;
  OnEndOfConversationActivity: SDKKinds.OnEndOfConversationActivity;
  OnError: SDKKinds.OnError;
  OnEventActivity: SDKKinds.OnEventActivity;
  OnHandoffActivity: SDKKinds.OnHandoffActivity;
  OnIntent: SDKKinds.OnIntent;
  OnInvokeActivity: SDKKinds.OnInvokeActivity;
  OnMessageActivity: SDKKinds.OnMessageActivity;
  OnMessageDeleteActivity: SDKKinds.OnMessageDeleteActivity;
  OnMessageReactionActivity: SDKKinds.OnMessageReactionActivity;
  OnMessageUpdateActivity: SDKKinds.OnMessageUpdateActivity;
  OnQnAMatch: SDKKinds.OnQnAMatch;
  OnRepromptDialog: SDKKinds.OnRepromptDialog;
  OnTypingActivity: SDKKinds.OnTypingActivity;
  OnUnknownIntent: SDKKinds.OnUnknownIntent;
  OrdinalEntityRecognizer: SDKKinds.OrdinalEntityRecognizer;
  PercentageEntityRecognizer: SDKKinds.PercentageEntityRecognizer;
  PhoneNumberEntityRecognizer: SDKKinds.PhoneNumberEntityRecognizer;
  QnAMakerDialog: SDKKinds.QnAMakerDialog;
  QnAMakerRecognizer: SDKKinds.QnAMakerRecognizer;
  RandomSelector: SDKKinds.RandomSelector;
  RecognizerSet: SDKKinds.RecognizerSet;
  RegexEntityRecognizer: SDKKinds.RegexEntityRecognizer;
  RegexRecognizer: SDKKinds.RegexRecognizer;
  RepeatDialog: SDKKinds.RepeatDialog;
  ReplaceDialog: SDKKinds.ReplaceDialog;
  ResourceMultiLanguageGenerator: SDKKinds.ResourceMultiLanguageGenerator;
  SendActivity: SDKKinds.SendActivity;
  SetProperties: SDKKinds.SetProperties;
  SetProperty: SDKKinds.SetProperty;
  SignOutUser: SDKKinds.SignOutUser;
  BeginSkill: SDKKinds.BeginSkill;
  StaticActivityTemplate: SDKKinds.StaticActivityTemplate;
  SwitchCondition: SDKKinds.SwitchCondition;
  TelemetryTrackEvent: SDKKinds.TelemetryTrackEvent;
  TemperatureEntityRecognizer: SDKKinds.TemperatureEntityRecognizer;
  TemplateEngineLanguageGenerator: SDKKinds.TemplateEngineLanguageGenerator;
  TextInput: SDKKinds.TextInput;
  TextTemplate: SDKKinds.TextTemplate;
  TraceActivity: SDKKinds.TraceActivity;
  TrueSelector: SDKKinds.TrueSelector;
  UpdateActivity: SDKKinds.UpdateActivity;
  UrlEntityRecognizer: SDKKinds.UrlEntityRecognizer;
};
export {};
//# sourceMappingURL=AdaptiveKinds.d.ts.map
