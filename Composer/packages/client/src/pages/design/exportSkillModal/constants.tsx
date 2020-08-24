// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { JSONSchema7 } from '@bfc/extension';
import { resolveRef } from '@bfc/adaptive-form';
import { SkillManifest } from '@bfc/shared';
import startCase from 'lodash/startCase';
import { SDKKinds } from '@bfc/shared';

import { nameRegex } from '../../../constants';

import {
  Description,
  Endpoints,
  FetchManifestSchema,
  ReviewManifest,
  SaveManifest,
  SelectDialogs,
  SelectManifest,
  SelectTriggers,
} from './content';

export const VERSION_REGEX = /\d\.\d\.(\d+|preview-\d+)/i;

export const SCHEMA_URIS = [
  'https://schemas.botframework.com/schemas/skills/skill-manifest-2.1.preview-1.json',
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
  manifest: Partial<SkillManifest>;
  setErrors: (errors: { [key: string]: any }) => void;
  setSchema: (_: JSONSchema7) => void;
  setSelectedDialogs: (dialogs: any[]) => void;
  setSelectedTriggers: (selectedTriggers: any[]) => void;
  setSkillManifest: (_: Partial<SkillManifest>) => void;
  schema: JSONSchema7;
  skillManifests: SkillManifest[];
  value: { [key: string]: any };
  onChange: (_: any) => void;
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
  skillManifests: SkillManifest[];
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
  ENDPOINTS = 'ENDPOINTS',
  FETCH_MANIFEST_SCHEMA = 'FETCH_MANIFEST_SCHEMA',
  MANIFEST_DESCRIPTION = 'MANIFEST_DESCRIPTION',
  MANIFEST_REVIEW = 'MANIFEST_REVIEW',
  SAVE_MANIFEST = 'SAVE_MANIFEST',
  SELECT_MANIFEST = 'SELECT_MANIFEST',
  SELECT_DIALOGS = 'SELECT_DIALOGS',
  SELECT_TRIGGERS = 'SELECT_TRIGGERS',
}

export const order: ManifestEditorSteps[] = [
  ManifestEditorSteps.SELECT_MANIFEST,
  ManifestEditorSteps.FETCH_MANIFEST_SCHEMA,
  ManifestEditorSteps.MANIFEST_DESCRIPTION,
  ManifestEditorSteps.ENDPOINTS,
  ManifestEditorSteps.SELECT_DIALOGS,
  ManifestEditorSteps.SELECT_TRIGGERS,
  ManifestEditorSteps.MANIFEST_REVIEW,
  ManifestEditorSteps.SAVE_MANIFEST,
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

export const editorSteps: { [key in ManifestEditorSteps]: EditorStep } = {
  [ManifestEditorSteps.SELECT_MANIFEST]: {
    buttons: [
      cancelButton,
      {
        disabled: ({ manifest }) => !manifest?.id,
        primary: true,
        text: () => formatMessage('Edit'),
        onClick: ({ onNext, manifest }) => () => {
          onNext({ id: manifest?.id });
        },
      },
    ],
    content: SelectManifest,
    editJson: false,
    subText: () => formatMessage('Create a new skill manifest or select which one you want to edit'),
    title: () => formatMessage('Create or edit skill manifest'),
  },
  [ManifestEditorSteps.FETCH_MANIFEST_SCHEMA]: {
    content: FetchManifestSchema,
    editJson: false,
    title: () => formatMessage('Select manifest version'),
  },
  [ManifestEditorSteps.MANIFEST_DESCRIPTION]: {
    buttons: [cancelButton, nextButton],
    content: Description,
    editJson: true,
    title: () => formatMessage('Describe your skill'),
    subText: () => formatMessage('To make your bot available for others as a skill, we need to generate a manifest.'),
    validate,
  },
  [ManifestEditorSteps.ENDPOINTS]: {
    buttons: [cancelButton, nextButton],
    content: Endpoints,
    editJson: true,
    subText: () =>
      formatMessage('We need to define the endpoints for the skill to allow other bots to interact with it.'),
    title: () => formatMessage('Skill endpoints'),
    validate: ({ content, schema }) => {
      const { items, minItems } = schema.properties?.endpoints;

      if (!content.endpoints || content.endpoints.length < minItems) {
        return { endpoints: formatMessage('Please add at least {minItems} endpoint', { minItems }) };
      }

      const endpointSchema = resolveRef(items, schema.definitions);
      const endpoints = (content.endpoints || []).map((endpoint) =>
        validate({ content: endpoint, schema: endpointSchema })
      );

      return endpoints.some((endpoint) => Object.keys(endpoint).length) ? { endpoints } : {};
    },
  },
  [ManifestEditorSteps.MANIFEST_REVIEW]: {
    buttons: [
      cancelButton,
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
      {
        primary: true,
        text: () => formatMessage('Next'),
        onClick: ({ onNext }) => onNext,
      },
    ],
    content: SelectDialogs,
    editJson: true,
    subText: () =>
      formatMessage(
        'These tasks will be used to generate the manifest and describe the capabilities of this skill to those who may want to use it.'
      ),
    title: () => formatMessage('Select which dialogs are included in the skill manifest'),
  },
  [ManifestEditorSteps.SELECT_TRIGGERS]: {
    buttons: [
      cancelButton,
      {
        primary: true,
        text: () => formatMessage('Generate'),
        onClick: ({ generateManifest, onNext }) => () => {
          generateManifest();
          onNext();
        },
      },
    ],
    content: SelectTriggers,
    editJson: true,
    subText: () =>
      formatMessage(
        'These tasks will be used to generate the manifest and describe the capabilities of this skill to those who may want to use it.'
      ),
    title: () => formatMessage('Select which tasks this skill can perform'),
  },
  [ManifestEditorSteps.SAVE_MANIFEST]: {
    buttons: [
      cancelButton,
      {
        primary: true,
        text: () => formatMessage('Save'),
        onClick: ({ onNext }) => () => {
          onNext({ dismiss: true, save: true });
        },
      },
    ],
    content: SaveManifest,
    editJson: true,
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
