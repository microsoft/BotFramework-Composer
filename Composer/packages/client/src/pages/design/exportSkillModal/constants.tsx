// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { JSONSchema7 } from '@bfc/extension';
import startCase from 'lodash/startCase';
import { SkillManifest } from '@bfc/shared';

import { Description, FetchManifestSchema, ReviewManifest, SelectManifest } from './content';

export const VERSION_REGEX = /\d\.\d\.(\d+|preview-\d+)/i;

export const SCHEMA_URIS = [
  'https://schemas.botframework.com/schemas/skills/skill-manifest-2.1.preview-1.json',
  'https://schemas.botframework.com/schemas/skills/skill-manifest-2.0.0.json',
];

export interface ContentProps {
  completeStep: () => void;
  errors: { [key: string]: any };
  editJson: () => void;
  setErrors: (errors: { [key: string]: any }) => void;
  setSchema: (_: JSONSchema7) => void;
  setSkillManifest: (name: string) => void;
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

interface EditorStep {
  buttons?: Button[];
  editJson?: boolean;
  helpLink?: string;
  title: () => string;
  subText?: () => any;
  content: React.FC<ContentProps>;
  validate?: (value: any, schema: any) => { [key: string]: any };
}

export enum ManifestEditorSteps {
  FETCH_MANIFEST_SCHEMA = 'FETCH_MANIFEST_SCHEMA',
  MANIFEST_DESCRIPTION = 'MANIFEST_DESCRIPTION',
  MANIFEST_REVIEW = 'MANIFEST_REVIEW',
  SELECT_MANIFEST = 'SELECT_MANIFEST',
}

export const order: ManifestEditorSteps[] = [
  ManifestEditorSteps.SELECT_MANIFEST,
  ManifestEditorSteps.FETCH_MANIFEST_SCHEMA,
  ManifestEditorSteps.MANIFEST_DESCRIPTION,
  ManifestEditorSteps.MANIFEST_REVIEW,
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

export const editorSteps: { [key in ManifestEditorSteps]: EditorStep } = {
  [ManifestEditorSteps.SELECT_MANIFEST]: {
    buttons: [
      cancelButton,
      {
        disabled: ({ manifest }) => !manifest,
        primary: true,
        text: () => formatMessage('Edit'),
        onClick: ({ onNext }) => onNext,
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
    validate: (value, schema) => {
      const required = schema?.required || [];

      return required
        .filter((key) => {
          const property = schema?.properties?.[key];
          return property && !['array', 'object'].includes(property.type);
        })
        .reduce((acc, key) => {
          if (!value?.[key]) {
            return { ...acc, [key]: formatMessage('Please enter a value for {key}', { key: startCase(key) }) };
          }
          return acc;
        }, {});
    },
  },
  [ManifestEditorSteps.MANIFEST_REVIEW]: {
    buttons: [
      cancelButton,
      {
        primary: true,
        text: () => formatMessage('Done'),
        onClick: ({ onDismiss }) => onDismiss,
      },
    ],
    content: ReviewManifest,
    subText: () => formatMessage('The manifest can be edited and refined manually if and where needed.'),
    title: () => formatMessage('Review and generate'),
  },
};
