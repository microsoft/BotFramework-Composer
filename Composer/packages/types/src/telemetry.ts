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

type SessionEvents = {
  SessionStarted: { resolution: string; pva: boolean };
  SessionEnded: undefined;
  NavigateTo: { sectionName: string };
};

type BotProjectEvents = {
  CreateNewBotProjectUsingNewButton: undefined;
  CreateNewBotProjectNextButton: undefined;
  CreateNewBotProjectFromExample: undefined;
  CreateNewBotProjectCompleted: undefined;
  BotProjectOpened: undefined;
};

type DesignerEvents = {
  ActionAdded: { type: string };
  ActionDeleted: { type: string };
  EditModeToggled: undefined;
  HelpLinkClicked: { url: string };
  ToolbarButtonClicked: { name: string };
  EmulatorButtonClicked: undefined;
  LeftMenuExpanded: undefined;
  LeftMenuCollapsed: undefined;
  LeftMenuFilterUsed: undefined;
  TooltipOpened: { location?: string; title: string };
  NewTriggerStarted: undefined;
  NewTriggerCompleted: { kind: string };
  NewDialogAdded: undefined;
  AddNewSkillStarted: undefined;
  AddNewSkillCompleted: undefined;
  UseCustomRuntimeToggle: undefined;
  NewTemplateAdded: undefined;
  FormDialogGenerated: { durationMilliseconds: number };
};

type QnaEvents = {
  NewKnowledgeBaseStarted: undefined;
  NewKnowledgeBaseCreated: undefined;
  NewQnAPair: undefined;
  AlternateQnAPhraseAdded: undefined;
  QnAEditModeToggled: undefined;
};

type PublishingEvents = {
  NewPublishingProfileStarted: undefined;
  NewPublishingProfileSaved: undefined;
  PublishingProfileStarted: undefined;
  PublishingProfileCompleted: undefined;
};

type AppSettingsEvents = {
  FeatureFlagChanged: { featureFlag: string; enabled: boolean };
};

type OtherEvents = {};

export type TelemetryEvents = BotProjectEvents &
  DesignerEvents &
  OtherEvents &
  SessionEvents &
  PublishingEvents &
  QnaEvents &
  AppSettingsEvents;

export type TelemetryEventName = keyof TelemetryEvents;
