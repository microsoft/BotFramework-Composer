// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TelemetrySettings } from './settings';

export type ServerSettings = Partial<{ telemetry: TelemetrySettings }>;

export type LogData = Record<string, unknown>;

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

  // Extensions
  Forms = 'Forms',
  PackageManger = 'PackageManger',
}

type ApplicationEvents = {
  NotificationPanelOpened: undefined;
};

type SessionEvents = {
  SessionStarted: { os: string };
  SessionEnded: undefined;
  NavigateTo: { sectionName: string; url: string };
};

type BotProjectEvents = {
  CreateNewBotProject: { method: 'toolbar' | 'newCallToAction' | 'luisCallToAction' };
  CreateNewBotProjectNextButton: { template: string };
  CreateNewBotProjectFromExample: { template: string };
  CreateNewBotProjectStarted: { template: string };
  CreateNewBotProjectCompleted: { template: string; status: number };
  BotProjectOpened: { method: 'toolbar' | 'callToAction' | 'list'; projectId?: string };
  StartAllBotsButtonClicked: undefined;
  StartBotButtonClicked: { isRoot: boolean; location: string; projectId: string };
  RestartAllBotsButtonClicked: undefined;
  StartBotStarted: { projectId: string };
  StartBotCompleted: { projectId: string; status: string };
  StopBotButtonClicked: { isRoot: boolean; location: string; projectId: string };
};

type DesignerEvents = {
  ActionAdded: { type: string };
  ActionDeleted: { type: string };
  EditModeToggled: { jsonView: boolean };
  HelpLinkClicked: { url: string };
  ToolbarButtonClicked: { name: string };
  EmulatorButtonClicked: { isRoot: boolean; projectId: string };
  LeftMenuModeToggled: { expanded: boolean };
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
  PublishingProfileStarted: { target: string; projectId: string };
  PublishingProfileCompleted: { target: string; projectId: string };
};

type AppSettingsEvents = {
  FeatureFlagChanged: { featureFlag: string; enabled: boolean };
};

type BotSettingsEvents = {
  CustomRuntimeToggleChanged: { enabled: boolean };
  GetNewRuntime: { runtimeType: string };
};

type LgEditorEvents = {
  LGEditorSwitchToCodeEditor: undefined;
  LGEditorSwitchToResponseEditor: undefined;
  LGEditorModalityAdded: { modality: string };
  LGEditorModalityDeleted: { modality: string };
  LGQuickInsertItem: {
    itemType: string;
    item?: string;
    location: 'LGCodeEditor' | 'LGResponseEditor';
  };
};

type OtherEvents = {
  LgTemplateLogged: {
    templateName: string;
    templateType: string;
    structuredType: string;
    speakEnabled: string;
    expressions: string[];
    projectId: string;
  };
};

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
  [PageNames.Forms]: undefined;
  [PageNames.PackageManger]: undefined;
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
  PageView &
  LgEditorEvents;

export type TelemetryEventName = keyof TelemetryEvents;

export type TelemetryClient = {
  track: <TN extends TelemetryEventName>(
    eventName: TN,
    properties?: TelemetryEvents[TN] extends undefined ? never : TelemetryEvents[TN]
  ) => void;

  pageView: <TN extends TelemetryEventName>(
    eventName: TN,
    url: string,
    properties?: TelemetryEvents[TN] extends undefined ? never : TelemetryEvents[TN]
  ) => void;
};
