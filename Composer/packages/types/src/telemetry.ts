// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TelemetrySettings } from './settings';

export type ServerSettings = Partial<{ telemetry: TelemetrySettings }>;

export type LogData = Record<string, unknown>;

export type TelemetryLogger = {
  logEvent: (name: string, properties: LogData) => void;
  logPageView: (name: string, url: string, properties: LogData) => void;
  drain?: () => void;
};

export enum TelemetryEventTypes {
  TrackEvent = 'TrackEvent',
  PageView = 'PageView',
}

export type TelemetryEvent = {
  type: TelemetryEventTypes;
  name: string;
  url?: string;
  properties?: LogData;
};

export enum PageNames {
  Design = 'Design',
  Home = 'Home',
  LanguageGeneration = 'LanguageGeneration',
  LanguageUnderstanding = 'LanguageUnderstanding',
  KnowledgeBase = 'KnowledgeBase',
  Publish = 'Publish',
  Diagnostics = 'Diagnostics',
  BotProjectsSettings = 'BotProjectsSettings',
  Plugin = 'Plugin',
  Settings = 'Settings',
  Unknown = 'Unknown',
}

type ApplicationEvents = {
  NotificationPanelOpened: undefined;
};

type SessionEvents = {
  SessionStarted: { resolution: string; os: string };
  SessionEnded: undefined;
  NavigateTo: { sectionName: string };
};

type BotProjectEvents = {
  CreateNewBotProject: { method: 'toolbar' | 'newCallToAction' | 'luisCallToAction' };
  CreateNewBotProjectNextButton: { template: string };
  CreateNewBotProjectFromExample: { template: string };
  CreateNewBotProjectCompleted: { template: string };
  BotProjectOpened: { method: 'toolbar' | 'callToAction' | 'list'; projectId?: string };
  StartAllBotsButtonClicked: undefined;
  StartBotButtonClicked: { isRoot: boolean; projectId };
  StartBotStarted: { projectId: string };
  StartBotCompleted: { projectId: string; status: string };
  StopAllBotsButtonClicked: undefined;
  StopBotButtonClicked: { isRoot: boolean; projectId: string };
};

type DesignerEvents = {
  ActionAdded: { type: string };
  ActionDeleted: { type: string };
  EditModeToggled: undefined;
  HelpLinkClicked: { url: string };
  ToolbarButtonClicked: { name: string };
  EmulatorButtonClicked: { isRoot: boolean };
  LeftMenuExpanded: undefined;
  LeftMenuCollapsed: undefined;
  ProjectTreeFilterUsed: undefined;
  TooltipOpened: { location?: string; title: string; duration: number };
  AddNewTriggerStarted: undefined;
  AddNewTriggerCompleted: { kind: string };
  AddNewDialogStarted: undefined;
  AddNewDialogCompleted: undefined;
  AddNewSkillStarted: { method: string };
  AddNewSkillCompleted: undefined;
  NewTemplateAdded: undefined;
  FormDialogGenerated: { durationMilliseconds: number };
};

type QnaEvents = {
  AddNewKnowledgeBaseStarted: undefined;
  AddNewKnowledgeBaseCompleted: undefined;
  NewQnAPair: undefined;
  AlternateQnAPhraseAdded: undefined;
};

type PublishingEvents = {
  NewPublishingProfileStarted: undefined;
  NewPublishingProfileSaved: { type: string };
  PublishingProfileStarted: undefined;
  PublishingProfileCompleted: { type: string };
};

type AppSettingsEvents = {
  FeatureFlagChanged: { featureFlag: string; enabled: boolean };
};

type BotSettingsEvents = {
  CustomRuntimeToggleChanged: { enabled: boolean };
  GetNewRuntime: { runtimeType: string };
};

type OtherEvents = {};

type PageView = {
  [PageNames.Design]: undefined;
  [PageNames.Home]: undefined;
  [PageNames.LanguageGeneration]: undefined;
  [PageNames.LanguageUnderstanding]: undefined;
  [PageNames.KnowledgeBase]: undefined;
  [PageNames.Publish]: undefined;
  [PageNames.Diagnostics]: undefined;
  [PageNames.BotProjectsSettings]: undefined;
  [PageNames.Plugin]: undefined;
  [PageNames.Settings]: undefined;
  [PageNames.Unknown]: undefined;
};

export type TelemetryEvents = ApplicationEvents &
  BotProjectEvents &
  DesignerEvents &
  SessionEvents &
  BotSettingsEvents &
  OtherEvents &
  PublishingEvents &
  QnaEvents &
  AppSettingsEvents &
  PageView;

export type TelemetryEventName = keyof TelemetryEvents;

export type TelemetryClient = {
  log: <TN extends TelemetryEventName>(
    eventName: TN,
    properties?: TelemetryEvents[TN] extends undefined ? never : TelemetryEvents[TN]
  ) => void;

  pageView: <TN extends TelemetryEventName>(
    eventName: TN,
    url: string,
    properties?: TelemetryEvents[TN] extends undefined ? never : TelemetryEvents[TN]
  ) => void;
};
