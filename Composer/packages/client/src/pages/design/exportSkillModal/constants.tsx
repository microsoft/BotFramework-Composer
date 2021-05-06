// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';
import { JSONSchema7 } from '@bfc/extension-client';
import { SkillManifestFile } from '@bfc/shared';
import startCase from 'lodash/startCase';
import { SDKKinds } from '@bfc/shared';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { nameRegex } from '../../../constants';

import { Description, ReviewManifest, SaveManifest, SelectDialogs, SelectTriggers } from './content';
import { SelectProfile } from './content/SelectProfile';
import { AddCallers } from './content/AddCallers';

export const VERSION_REGEX = /\d\.\d+\.(\d+|preview-\d+)|\d\.\d+/i;

export const SCHEMA_URIS = [
  'https://schemas.botframework.com/schemas/skills/v2.1/skill-manifest.json',
  'https://schemas.botframework.com/schemas/skills/skill-manifest-2.0.0.json',
];

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
  SAVE_MANIFEST = 'SAVE_MANIFEST',
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

function makeLink(url: string) {
  return ({ children }) => (
    <Link key={url} href={url} rel="noopener noreferrer" target="_blank">
      {children}
    </Link>
  );
}

export const editorSteps: { [key in ManifestEditorSteps]: EditorStep } = {
  [ManifestEditorSteps.MANIFEST_DESCRIPTION]: {
    buttons: [cancelButton, nextButton],
    content: Description,
    editJson: false,
    title: () => formatMessage('Export your bot'),
    subText: () =>
      formatMessage.rich(
        'A skill is a bot that can perform a set of tasks one or more bots.  To make your bot available as a skill, it needs a manifest - a JSON file that describes the actions the skill can perform. <link>Learn more.</link>',
        {
          link: makeLink('https://docs.microsoft.com/en-us/composer/how-to-export-a-skill'),
        }
      ),
    validate,
  },
  [ManifestEditorSteps.SELECT_PROFILE]: {
    buttons: [
      cancelButton,
      backButton,
      {
        disabled: ({ publishTargets }) => {
          try {
            return (
              publishTargets.findIndex((item) => {
                const config = JSON.parse(item.configuration);
                return (
                  config.settings &&
                  config.settings.MicrosoftAppId &&
                  config.hostname &&
                  config.settings.MicrosoftAppId.length > 0 &&
                  config.hostname.length > 0
                );
              }) < 0
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
      formatMessage.rich(
        'To ensure a secure connection, provide the App ID of the bots that can connect to your skill.  If you don’t have this information, you can also add this information in Skill Configuration. <link>Learn more.</link>',
        {
          link: makeLink('https://docs.microsoft.com/en-us/composer/how-to-connect-to-a-skill'),
        }
      ),
    title: () => formatMessage('Which bots can connect to this skill?'),
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
        'The capabilities of your bot are defined in its dialogs and triggers. Selected dialogs will be included in the manifest. Internal dialogs or actions may not be relevant to other bots. Learn more.'
      ),
    title: () => formatMessage('Select dialogs'),
  },
  [ManifestEditorSteps.SELECT_TRIGGERS]: {
    buttons: [
      cancelButton,
      backButton,
      {
        primary: true,
        text: () => formatMessage('Next'),
        onClick: ({ onNext, generateManifest }) => () => {
          // generateManifest();
          onNext();
        },
      },
    ],
    content: SelectTriggers,
    editJson: false,
    subText: () =>
      formatMessage(
        'Triggers selected below will enable other bots to access the capabilities of your skill. Learn more.'
      ),
    title: () => formatMessage('Select triggers'),
  },
  [ManifestEditorSteps.SAVE_MANIFEST]: {
    buttons: [
      cancelButton,
      backButton,
      {
        primary: true,
        text: () => formatMessage('Save'),
        onClick: ({ onNext }) => () => {
          onNext({ dismiss: true, save: true });
        },
      },
    ],
    content: SaveManifest,
    editJson: false,
    subText: () => formatMessage('Name and save your skill manifest.'),
    title: () => formatMessage('Save your skill manifest'),
    validate: ({ editingId, id, skillManifests }) => {
      if (!id || !nameRegex.test(id)) {
        return { id: formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.') };
      }

      if (
        (typeof editingId === 'undefined' || editingId !== id) &&
        skillManifests.some(({ id: manifestId }) => manifestId === id)
      ) {
        return { id: formatMessage('{id} already exists. Please enter a unique file name.', { id }) };
      }

      return {};
    },
  },
};
