// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7 } from 'json-schema';

// All of the known SDK types. Update this list when we take a schema update.
// To get this list copy the output of the following commands in a node repl from the project root:

/**
 * All SDK Types defined by the schema.
 * All references of the type should be accessed through this enum.
 */
export enum SDKKinds {
  ActivityTemplate = 'Microsoft.ActivityTemplate',
  AdaptiveDialog = 'Microsoft.AdaptiveDialog',
  AgeEntityRecognizer = 'Microsoft.AgeEntityRecognizer',
  Ask = 'Microsoft.Ask',
  AttachmentInput = 'Microsoft.AttachmentInput',
  BeginDialog = 'Microsoft.BeginDialog',
  BeginSkill = 'Microsoft.BeginSkill',
  BreakLoop = 'Microsoft.BreakLoop',
  CancelAllDialogs = 'Microsoft.CancelAllDialogs',
  CancelDialog = 'Microsoft.CancelDialog',
  ChannelMentionEntityRecognizer = 'Microsoft.ChannelMentionEntityRecognizer',
  ChoiceInput = 'Microsoft.ChoiceInput',
  ConditionalSelector = 'Microsoft.ConditionalSelector',
  ConfirmInput = 'Microsoft.ConfirmInput',
  ConfirmationEntityRecognizer = 'Microsoft.ConfirmationEntityRecognizer',
  ContinueConversationLater = 'Microsoft.ContinueConversationLater',
  ContinueLoop = 'Microsoft.ContinueLoop',
  CrossTrainedRecognizerSet = 'Microsoft.CrossTrainedRecognizerSet',
  CurrencyEntityRecognizer = 'Microsoft.CurrencyEntityRecognizer',
  DateTimeEntityRecognizer = 'Microsoft.DateTimeEntityRecognizer',
  DateTimeInput = 'Microsoft.DateTimeInput',
  DebugBreak = 'Microsoft.DebugBreak',
  DeleteActivity = 'Microsoft.DeleteActivity',
  DeleteProperties = 'Microsoft.DeleteProperties',
  DeleteProperty = 'Microsoft.DeleteProperty',
  DimensionEntityRecognizer = 'Microsoft.DimensionEntityRecognizer',
  EditActions = 'Microsoft.EditActions',
  EditArray = 'Microsoft.EditArray',
  EmailEntityRecognizer = 'Microsoft.EmailEntityRecognizer',
  EmitEvent = 'Microsoft.EmitEvent',
  EndDialog = 'Microsoft.EndDialog',
  EndTurn = 'Microsoft.EndTurn',
  FirstSelector = 'Microsoft.FirstSelector',
  Foreach = 'Microsoft.Foreach',
  ForeachPage = 'Microsoft.ForeachPage',
  GetActivityMembers = 'Microsoft.GetActivityMembers',
  GetConversationMembers = 'Microsoft.GetConversationMembers',
  GotoAction = 'Microsoft.GotoAction',
  GuidEntityRecognizer = 'Microsoft.GuidEntityRecognizer',
  HashtagEntityRecognizer = 'Microsoft.HashtagEntityRecognizer',
  HttpRequest = 'Microsoft.HttpRequest',
  IActivityTemplate = 'Microsoft.IActivityTemplate',
  IDialog = 'Microsoft.IDialog',
  IEntityRecognizer = 'Microsoft.IEntityRecognizer',
  ILanguageGenerator = 'Microsoft.ILanguageGenerator',
  IRecognizer = 'Microsoft.IRecognizer',
  ITextTemplate = 'Microsoft.ITextTemplate',
  ITrigger = 'Microsoft.ITrigger',
  ITriggerSelector = 'Microsoft.ITriggerSelector',
  IfCondition = 'Microsoft.IfCondition',
  InputDialog = 'Microsoft.InputDialog',
  IpEntityRecognizer = 'Microsoft.IpEntityRecognizer',
  LanguagePolicy = 'Microsoft.LanguagePolicy',
  LogAction = 'Microsoft.LogAction',
  LuisRecognizer = 'Microsoft.LuisRecognizer',
  MentionEntityRecognizer = 'Microsoft.MentionEntityRecognizer',
  MostSpecificSelector = 'Microsoft.MostSpecificSelector',
  MultiLanguageRecognizer = 'Microsoft.MultiLanguageRecognizer',
  NumberEntityRecognizer = 'Microsoft.NumberEntityRecognizer',
  NumberInput = 'Microsoft.NumberInput',
  NumberRangeEntityRecognizer = 'Microsoft.NumberRangeEntityRecognizer',
  OAuthInput = 'Microsoft.OAuthInput',
  OnActivity = 'Microsoft.OnActivity',
  OnAssignEntity = 'Microsoft.OnAssignEntity',
  OnBeginDialog = 'Microsoft.OnBeginDialog',
  OnCancelDialog = 'Microsoft.OnCancelDialog',
  OnChooseEntity = 'Microsoft.OnChooseEntity',
  OnChooseIntent = 'Microsoft.OnChooseIntent',
  OnChooseProperty = 'Microsoft.OnChooseProperty',
  OnCondition = 'Microsoft.OnCondition',
  OnContinueConversation = 'Microsoft.OnContinueConversation',
  OnConversationUpdateActivity = 'Microsoft.OnConversationUpdateActivity',
  OnDialogEvent = 'Microsoft.OnDialogEvent',
  OnEndOfActions = 'Microsoft.OnEndOfActions',
  OnEndOfConversationActivity = 'Microsoft.OnEndOfConversationActivity',
  OnError = 'Microsoft.OnError',
  OnEventActivity = 'Microsoft.OnEventActivity',
  OnHandoffActivity = 'Microsoft.OnHandoffActivity',
  OnInstallationUpdateActivity = 'Microsoft.OnInstallationUpdateActivity',
  OnIntent = 'Microsoft.OnIntent',
  OnInvokeActivity = 'Microsoft.OnInvokeActivity',
  OnMessageActivity = 'Microsoft.OnMessageActivity',
  OnMessageDeleteActivity = 'Microsoft.OnMessageDeleteActivity',
  OnMessageReactionActivity = 'Microsoft.OnMessageReactionActivity',
  OnMessageUpdateActivity = 'Microsoft.OnMessageUpdateActivity',
  OnQnAMatch = 'Microsoft.OnQnAMatch',
  OnRepromptDialog = 'Microsoft.OnRepromptDialog',
  OnTypingActivity = 'Microsoft.OnTypingActivity',
  OnUnknownIntent = 'Microsoft.OnUnknownIntent',
  OrchestratorRecognizer = 'Microsoft.OrchestratorRecognizer',
  OrdinalEntityRecognizer = 'Microsoft.OrdinalEntityRecognizer',
  PercentageEntityRecognizer = 'Microsoft.PercentageEntityRecognizer',
  PhoneNumberEntityRecognizer = 'Microsoft.PhoneNumberEntityRecognizer',
  QnAMakerDialog = 'Microsoft.QnAMakerDialog',
  QnAMakerRecognizer = 'Microsoft.QnAMakerRecognizer',
  RandomSelector = 'Microsoft.RandomSelector',
  RecognizerSet = 'Microsoft.RecognizerSet',
  RegexEntityRecognizer = 'Microsoft.RegexEntityRecognizer',
  RegexRecognizer = 'Microsoft.RegexRecognizer',
  RepeatDialog = 'Microsoft.RepeatDialog',
  ReplaceDialog = 'Microsoft.ReplaceDialog',
  ResourceMultiLanguageGenerator = 'Microsoft.ResourceMultiLanguageGenerator',
  SendActivity = 'Microsoft.SendActivity',
  SetProperties = 'Microsoft.SetProperties',
  SetProperty = 'Microsoft.SetProperty',
  SignOutUser = 'Microsoft.SignOutUser',
  StaticActivityTemplate = 'Microsoft.StaticActivityTemplate',
  SwitchCondition = 'Microsoft.SwitchCondition',
  TelemetryTrackEvent = 'Microsoft.TelemetryTrackEvent',
  TemperatureEntityRecognizer = 'Microsoft.TemperatureEntityRecognizer',
  TemplateEngineLanguageGenerator = 'Microsoft.TemplateEngineLanguageGenerator',
  TextInput = 'Microsoft.TextInput',
  TextTemplate = 'Microsoft.TextTemplate',
  ThrowException = 'Microsoft.ThrowException',
  TraceActivity = 'Microsoft.TraceActivity',
  TrueSelector = 'Microsoft.TrueSelector',
  UpdateActivity = 'Microsoft.UpdateActivity',
  UrlEntityRecognizer = 'Microsoft.UrlEntityRecognizer',
  GetMeetingParticipant = 'Teams.GetMeetingParticipant',
  GetMember = 'Teams.GetMember',
  OnAppBasedLinkQuery = 'Teams.OnAppBasedLinkQuery',
  OnCardAction = 'Teams.OnCardAction',
  OnChannelCreated = 'Teams.OnChannelCreated',
  OnChannelDeleted = 'Teams.OnChannelDeleted',
  OnChannelRenamed = 'Teams.OnChannelRenamed',
  OnChannelRestored = 'Teams.OnChannelRestored',
  OnFileConsent = 'Teams.OnFileConsent',
  OnMessagingExtensionCardButtonClicked = 'Teams.OnMessagingExtensionCardButtonClicked',
  OnMessagingExtensionConfigurationQuerySettingUrl = 'Teams.OnMessagingExtensionConfigurationQuerySettingUrl',
  OnMessagingExtensionConfigurationSetting = 'Teams.OnMessagingExtensionConfigurationSetting',
  OnMessagingExtensionFetchTask = 'Teams.OnMessagingExtensionFetchTask',
  OnMessagingExtensionQuery = 'Teams.OnMessagingExtensionQuery',
  OnMessagingExtensionSelectItem = 'Teams.OnMessagingExtensionSelectItem',
  OnMessagingExtensionSubmitAction = 'Teams.OnMessagingExtensionSubmitAction',
  OnO365ConnectorCardAction = 'Teams.OnO365ConnectorCardAction',
  OnTaskModuleFetch = 'Teams.OnTaskModuleFetch',
  OnTaskModuleSubmit = 'Teams.OnTaskModuleSubmit',
  OnTeamArchived = 'Teams.OnTeamArchived',
  OnTeamDeleted = 'Teams.OnTeamDeleted',
  OnTeamHardDeleted = 'Teams.OnTeamHardDeleted',
  OnTeamRenamed = 'Teams.OnTeamRenamed',
  OnTeamRestored = 'Teams.OnTeamRestored',
  OnTeamUnarchived = 'Teams.OnTeamUnarchived',
  SendMessagingExtensionAuthResponse = 'Teams.SendMessagingExtensionAuthResponse',
  SendMessagingExtensionQueryLinkResponse = 'Teams.SendMessagingExtensionQueryLinkResponse',
  SendTaskModuleContinueResponse = 'Teams.SendTaskModuleContinueResponse',
  SendTaskModuleMessageResponse = 'Teams.SendTaskModuleMessageResponse',
}

export enum SDKRoles {
  expression = 'expression',
  // TODO
  // union = 'union',
  // union_*_ = 'union(*)',
}

export interface DefinitionSummary {
  title: string;
  description: string;
  $ref: string;
}

export type SchemaDefinitions = {
  [key: string]: AdaptiveSchema;
};

interface AdaptiveSchema extends Omit<JSONSchema7, 'definitions' | 'properties' | 'additionalProperties'> {
  $copy?: string;
  $id?: string;
  $kind?: string;
  $role?: string;
  $designer?: {
    id: string;
    [key: string]: any;
  };
  definitions?: SchemaDefinitions;
  oneOf?: AdaptiveSchema[];
  properties?: SchemaDefinitions;
  additionalProperties?: boolean | AdaptiveSchema;
  items?: AdaptiveSchema | AdaptiveSchema[];
}

// Re-export monkey patched json schema interfaces
export { AdaptiveSchema as JSONSchema7 };

export type DefinitionCache = Map<string, AdaptiveSchema>;
