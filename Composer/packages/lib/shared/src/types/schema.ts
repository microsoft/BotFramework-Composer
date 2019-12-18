// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema6 } from 'json-schema';

// All of the known SDK types. Update this list when we take a schema update.
// To get this list copy the output of the following commands in a node repl from the project root:

// const schema = JSON.parse(fs.readFileSync('./BotProject/CSharp/Schemas/sdk.schema', 'utf-8'));
// const types = schema.oneOf.map(t => t.title);
// let uType = 'export enum SDKTypes {\n';
// uType += types.map(t => `  ${t.replace('Microsoft.', '')} = '${t}',`).join('\n');
// uType += '\n}';
// console.log(uType);

/**
 * All SDK Types defined by the schema.
 * All references of the type should be accessed through this enum.
 * */

export enum SDKTypes {
  ActivityTemplate = 'Microsoft.ActivityTemplate',
  AdaptiveDialog = 'Microsoft.AdaptiveDialog',
  AgeEntityRecognizer = 'Microsoft.AgeEntityRecognizer',
  AttachmentInput = 'Microsoft.AttachmentInput',
  BeginDialog = 'Microsoft.BeginDialog',
  CancelAllDialogs = 'Microsoft.CancelAllDialogs',
  ChoiceInput = 'Microsoft.ChoiceInput',
  ConditionalSelector = 'Microsoft.ConditionalSelector',
  ConfirmInput = 'Microsoft.ConfirmInput',
  ConfirmationEntityRecognizer = 'Microsoft.ConfirmationEntityRecognizer',
  CurrencyEntityRecognizer = 'Microsoft.CurrencyEntityRecognizer',
  DateTimeEntityRecognizer = 'Microsoft.DateTimeEntityRecognizer',
  DateTimeInput = 'Microsoft.DateTimeInput',
  DebugBreak = 'Microsoft.DebugBreak',
  DeleteProperty = 'Microsoft.DeleteProperty',
  DeleteProperties = 'Microsoft.DeleteProperties',
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
  GuidEntityRecognizer = 'Microsoft.GuidEntityRecognizer',
  HashtagEntityRecognizer = 'Microsoft.HashtagEntityRecognizer',
  HttpRequest = 'Microsoft.HttpRequest',
  IfCondition = 'Microsoft.IfCondition',
  InitProperty = 'Microsoft.InitProperty',
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
  OnBeginDialog = 'Microsoft.OnBeginDialog',
  OnCancelDialog = 'Microsoft.OnCancelDialog',
  OnCondition = 'Microsoft.OnCondition',
  OnConversationUpdateActivity = 'Microsoft.OnConversationUpdateActivity',
  OnCustomEvent = 'Microsoft.OnCustomEvent',
  OnDialogEvent = 'Microsoft.OnDialogEvent',
  OnEndOfConversationActivity = 'Microsoft.OnEndOfConversationActivity',
  OnError = 'Microsoft.OnError',
  OnEventActivity = 'Microsoft.OnEventActivity',
  OnHandoffActivity = 'Microsoft.OnHandoffActivity',
  OnIntent = 'Microsoft.OnIntent',
  OnInvokeActivity = 'Microsoft.OnInvokeActivity',
  OnMessageActivity = 'Microsoft.OnMessageActivity',
  OnMessageDeleteActivity = 'Microsoft.OnMessageDeleteActivity',
  OnMessageReactionActivity = 'Microsoft.OnMessageReactionActivity',
  OnMessageUpdateActivity = 'Microsoft.OnMessageUpdateActivity',
  OnRepromptDialog = 'Microsoft.OnRepromptDialog',
  OnTypingActivity = 'Microsoft.OnTypingActivity',
  OnUnknownIntent = 'Microsoft.OnUnknownIntent',
  OrdinalEntityRecognizer = 'Microsoft.OrdinalEntityRecognizer',
  PercentageEntityRecognizer = 'Microsoft.PercentageEntityRecognizer',
  PhoneNumberEntityRecognizer = 'Microsoft.PhoneNumberEntityRecognizer',
  QnAMakerDialog = 'Microsoft.QnAMakerDialog',
  RandomSelector = 'Microsoft.RandomSelector',
  RegExEntityRecognizer = 'Microsoft.RegExEntityRecognizer',
  RegexRecognizer = 'Microsoft.RegexRecognizer',
  RepeatDialog = 'Microsoft.RepeatDialog',
  ReplaceDialog = 'Microsoft.ReplaceDialog',
  SendActivity = 'Microsoft.SendActivity',
  SetProperty = 'Microsoft.SetProperty',
  SetProperties = 'Microsoft.SetProperties',
  StaticActivityTemplate = 'Microsoft.StaticActivityTemplate',
  SwitchCondition = 'Microsoft.SwitchCondition',
  TemperatureEntityRecognizer = 'Microsoft.TemperatureEntityRecognizer',
  TextInput = 'Microsoft.TextInput',
  TextTemplate = 'Microsoft.TextTemplate',
  TraceActivity = 'Microsoft.TraceActivity',
  TrueSelector = 'Microsoft.TrueSelector',
  UrlEntityRecognizer = 'Microsoft.UrlEntityRecognizer',
}

export interface OBISchema extends JSONSchema6 {
  $schema?: string;
  $role?: string;
  $type?: SDKTypes;
  $copy?: string;
  $id?: string;
  $designer?: {
    id: string;
    [key: string]: any;
  };
  description?: string;
  definitions?: any;
  title?: string;
  __additional_property?: boolean;
}
