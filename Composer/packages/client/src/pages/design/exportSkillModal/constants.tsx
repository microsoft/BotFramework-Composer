// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { JSONSchema7 } from '@bfc/extension-client';
import { SkillManifestFile } from '@bfc/shared';
import startCase from 'lodash/startCase';
import { SDKKinds } from '@bfc/shared';

import { Description, ReviewManifest, SelectDialogs, SelectTriggers, SelectProfile } from './content';
import { AddCallers } from './content/AddCallers';

export const VERSION_REGEX = /\d\.\d+\.(\d+|preview-\d+)|\d\.\d+/i;

export const SCHEMA_URI = 'https://schemas.botframework.com/schemas/skills/v2.2/skill-manifest.json';

export enum ActivityTypes {
  ContactRelationUpdate = 'contactRelationUpdate',
  ConversationUpdate = 'conversationUpdate',
  DeleteUserData = 'deleteUserData',
  EndOfConversation = 'endOfConversation',
  Event = 'event',
  Handoff = 'handoff',
  InstallationUpdate = 'installationUpdate',
  Invoke = 'invoke',
  Message = 'message',
  MessageDelete = 'messageDelete',
  MessageReaction = 'messageReaction',
  MessageUpdate = 'messageUpdate',
  Suggestion = 'suggestion',
  Trace = 'trace',
  Typing = 'typing',
}

export const activityHandlerMap = {
  [SDKKinds.AdaptiveDialog]: ActivityTypes.Event,
  [SDKKinds.OnConversationUpdateActivity]: ActivityTypes.ConversationUpdate,
  [SDKKinds.OnEndOfConversationActivity]: ActivityTypes.EndOfConversation,
  [SDKKinds.OnIntent]: ActivityTypes.Message,
  [SDKKinds.OnHandoffActivity]: ActivityTypes.Handoff,
  [SDKKinds.OnMessageActivity]: ActivityTypes.Message,
  [SDKKinds.OnMessageDeleteActivity]: ActivityTypes.MessageDelete,
  [SDKKinds.OnMessageReactionActivity]: ActivityTypes.MessageReaction,
  [SDKKinds.OnMessageUpdateActivity]: ActivityTypes.MessageUpdate,
  [SDKKinds.OnTypingActivity]: ActivityTypes.Typing,
};

export interface Activity {
  type: string;
  name?: string;
  value?: any;
  resultValue?: any;
}

export interface Activities {
  [name: string]: Activity;
}

export interface Language {
  contentType: string;
  descriptions?: string;
  name: string;
  url: string;
}

export interface DispatchModels {
  languages?: {
    [local: string]: Language[];
  };
  intents?: string[];
}

export interface ContentProps {
  completeStep: () => void;
  errors: { [key: string]: any };
  editJson: () => void;
  manifest: Partial<SkillManifestFile>;
  setErrors: (errors: { [key: string]: any }) => void;
  setSchema: (_: JSONSchema7) => void;
  setSelectedDialogs: (dialogs: any[]) => void;
  setSelectedTriggers: (selectedTriggers: any[]) => void;
  setSkillManifest: (_: Partial<SkillManifestFile>) => void;
  onUpdateIsCreateProfileFromSkill: (isCreateProfileFromSkill: boolean) => void;
  schema: JSONSchema7;
  selectedDialogs: any[];
  selectedTriggers: any[];
  skillManifests: SkillManifestFile[];
  value: { [key: string]: any };
  onChange: (_: any) => void;
  projectId: string;
  callers: string[];
  onUpdateCallers: (callers: string[]) => void;
}

interface Button {
  disabled?: ((_: any) => boolean) | boolean;
  primary?: boolean;
  text: () => string;
  onClick: (_: any) => () => void;
}

interface ValidationDetails {
  content: any;
  editingId?: string;
  id?: string;
  schema: any;
  skillManifests: SkillManifestFile[];
}

interface EditorStep {
  buttons?: Button[];
  editJson?: boolean;
  helpLink?: string;
  title: () => string;
  subText?: () => any;
  content: React.FC<ContentProps>;
  validate?: (_: ValidationDetails) => { [key: string]: any };
}

export enum ManifestEditorSteps {
  MANIFEST_DESCRIPTION = 'MANIFEST_DESCRIPTION',
  MANIFEST_REVIEW = 'MANIFEST_REVIEW',
  SELECT_DIALOGS = 'SELECT_DIALOGS',
  SELECT_TRIGGERS = 'SELECT_TRIGGERS',
  SELECT_PROFILE = 'SELECT_PROFILE',
  ADD_CALLERS = 'ADD_CALLERS',
}

export const order: ManifestEditorSteps[] = [
  ManifestEditorSteps.MANIFEST_DESCRIPTION,
  ManifestEditorSteps.SELECT_DIALOGS,
  ManifestEditorSteps.SELECT_TRIGGERS,
  ManifestEditorSteps.ADD_CALLERS,
  ManifestEditorSteps.SELECT_PROFILE,
];

const cancelButton: Button = {
  text: () => formatMessage('Cancel'),
  onClick: ({ onDismiss }) => onDismiss,
};

const nextButton: Button = {
  primary: true,
  text: () => formatMessage('Next'),
  onClick: ({ onNext }) => onNext,
};

const backButton: Button = {
  primary: true,
  text: () => formatMessage('Back'),
  onClick: ({ onBack }) => onBack,
};

const validate = ({ content, schema }) => {
  const required = schema?.required || [];

  return required
    .filter((key) => {
      const property = schema?.properties?.[key];
      return property && !['array', 'object'].includes(property.type);
    })
    .reduce((acc, key) => {
      if (!content?.[key]) {
        const { title } = schema.properties[key];
        return { ...acc, [key]: formatMessage('Please enter a value for {key}', { key: title || startCase(key) }) };
      }
      return acc;
    }, {});
};

const helpLink = 'https://aka.ms/AAct49m';

export const editorSteps: { [key in ManifestEditorSteps]: EditorStep } = {
  [ManifestEditorSteps.MANIFEST_DESCRIPTION]: {
    buttons: [cancelButton, nextButton],
    content: Description,
    editJson: false,
    title: () => formatMessage('Export your bot'),
    subText: () =>
      formatMessage(
        'A skill is a bot that can perform a set of tasks one or more bots.  To make your bot available as a skill, it needs a manifest - a JSON file that describes the actions the skill can perform.'
      ),
    validate,
  },
  [ManifestEditorSteps.SELECT_PROFILE]: {
    buttons: [
      cancelButton,
      backButton,
      {
        disabled: ({ publishTarget }) => {
          try {
            const config = JSON.parse(publishTarget.configuration);
            return !(
              config.settings &&
              config.settings.MicrosoftAppId &&
              config.hostname &&
              config.settings.MicrosoftAppId.length > 0 &&
              config.hostname.length > 0
            );
          } catch (err) {
            console.log(err.message);
            return true;
          }
        },

        primary: true,
        text: () => formatMessage('Generate and Publish'),
        onClick: ({ generateManifest, onNext, onPublish }) => () => {
          generateManifest();
          onNext({ dismiss: true, save: true });
          onPublish();
        },
      },
    ],
    editJson: false,
    content: SelectProfile,
    subText: () =>
      formatMessage('We need to define the endpoints for the skill to allow other bots to interact with it.'),
    title: () => formatMessage('Confirm skill endpoints'),
  },
  [ManifestEditorSteps.ADD_CALLERS]: {
    buttons: [
      cancelButton,
      backButton,
      {
        primary: true,
        text: () => formatMessage('Next'),
        onClick: ({ onNext, onSaveSkill }) => () => {
          onSaveSkill();
          onNext();
        },
      },
    ],
    editJson: false,
    content: AddCallers,
    subText: () =>
      formatMessage(
        'To ensure a secure connection, provide the App ID of the bots that can connect to your skill.  If you don’t have this information, you can also add this information in Skill Configuration.'
      ),
    title: () => formatMessage('Which bots can connect to this skill?'),
    helpLink,
  },
  [ManifestEditorSteps.MANIFEST_REVIEW]: {
    buttons: [
      cancelButton,
      backButton,
      {
        primary: true,
        text: () => formatMessage('Next'),
        onClick: ({ onNext }) => onNext,
      },
    ],
    content: ReviewManifest,
    subText: () => formatMessage('The manifest can be edited and refined manually if and where needed.'),
    title: () => formatMessage('Review and generate'),
  },
  [ManifestEditorSteps.SELECT_DIALOGS]: {
    buttons: [
      cancelButton,
      backButton,
      {
        primary: true,
        text: () => formatMessage('Next'),
        onClick: ({ onNext }) => onNext,
      },
    ],
    content: SelectDialogs,
    editJson: false,
    subText: () =>
      formatMessage(
        'The capabilities of your bot are defined in its dialogs and triggers. Selected dialogs will be included in the manifest. Internal dialogs or actions may not be relevant to other bots.'
      ),
    title: () => formatMessage('Select dialogs'),
    helpLink,
  },
  [ManifestEditorSteps.SELECT_TRIGGERS]: {
    buttons: [
      cancelButton,
      backButton,
      {
        primary: true,
        text: () => formatMessage('Next'),
        onClick: ({ onNext }) => () => {
          onNext();
        },
      },
    ],
    content: SelectTriggers,
    editJson: false,
    subText: () =>
      formatMessage('Triggers selected below will enable other bots to access the capabilities of your skill.'),
    title: () => formatMessage('Select triggers'),
    helpLink,
  },
};
