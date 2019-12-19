// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import nanoid from 'nanoid/generate';

import { DesignerData } from './types/sdk';
import { appschema } from './appschema';
import { copyAdaptiveAction } from './copyUtils';
import { deleteAdaptiveAction, deleteAdaptiveActionList } from './deleteUtils';
import { MicrosoftIDialog } from './types';

interface DesignerAttributes {
  name: string;
  description: string;
}

const initialInputDialog = {
  allowInterruptions: 'false',
  prompt: '',
  unrecognizedPrompt: '',
  invalidPrompt: '',
  defaultValueResponse: '',
};

const initialDialogShape = {
  'Microsoft.AdaptiveDialog': {
    $type: 'Microsoft.AdaptiveDialog',
    triggers: [
      {
        $type: 'Microsoft.OnBeginDialog',
        $designer: {
          name: 'BeginDialog',
        },
      },
    ],
  },
  'Microsoft.OnConversationUpdateActivity': {
    $type: 'Microsoft.OnConversationUpdateActivity',
    actions: [
      {
        $type: 'Microsoft.Foreach',
        $designer: {
          name: 'Loop: for each item',
        },
        itemsProperty: 'turn.Activity.membersAdded',
        actions: [
          {
            $type: 'Microsoft.IfCondition',
            $designer: {
              name: 'Branch: if/else',
            },
            condition: 'string(dialog.foreach.value.id) != string(turn.Activity.Recipient.id)',
            actions: [
              {
                $type: 'Microsoft.SendActivity',
                $designer: {
                  name: 'Send a response',
                },
                activity: '',
              },
            ],
          },
        ],
      },
    ],
  },
  'Microsoft.SendActivity': {
    activity: '',
  },
  'Microsoft.AttachmentInput': initialInputDialog,
  'Microsoft.ChoiceInput': initialInputDialog,
  'Microsoft.ConfirmInput': initialInputDialog,
  'Microsoft.DateTimeInput': initialInputDialog,
  'Microsoft.NumberInput': initialInputDialog,
  'Microsoft.TextInput': initialInputDialog,
};

export function getNewDesigner(name: string, description: string) {
  return {
    $designer: {
      name,
      description,
      id: nanoid('1234567890', 6),
    },
  };
}

export const getDesignerId = (data?: DesignerData) => {
  const newDesigner: DesignerData = {
    ...data,
    id: nanoid('1234567890', 6),
  };

  return newDesigner;
};

const assignDefaults = (data: {}, currentSeed = {}) => {
  for (const field in data) {
    if (field !== '$designer' && data[field].type === 'object') {
      // recurse on subtree's properties
      currentSeed[field] = assignDefaults(data[field].properties);
    }
    if (data[field].const !== null && data[field].const !== undefined) {
      currentSeed[field] = data[field].const;
    }
    if (data[field].default !== null && data[field].default !== undefined) {
      currentSeed[field] = data[field].default;
    }
  }
  return Object.keys(currentSeed).length > 0 ? currentSeed : undefined;
};

export const seedDefaults = (type: string) => {
  if (!appschema.definitions[type]) return {};
  const { properties } = appschema.definitions[type];
  return assignDefaults(properties);
};

export const deepCopyAction = async (
  data,
  copyLgTemplateToNewNode: (lgTemplateName: string, newNodeId: string) => Promise<string>
) => {
  return await copyAdaptiveAction(data, {
    getDesignerId,
    copyLgTemplate: copyLgTemplateToNewNode,
  });
};

export const deleteAction = (data: MicrosoftIDialog, deleteLgTemplates: (templates: string[]) => any) => {
  return deleteAdaptiveAction(data, deleteLgTemplates);
};

export const deleteActions = (inputs: MicrosoftIDialog[], deleteLgTemplates: (templates: string[]) => any) => {
  return deleteAdaptiveActionList(inputs, deleteLgTemplates);
};

export const seedNewDialog = (
  $type: string,
  designerAttributes: Partial<DesignerAttributes> = {},
  optionalAttributes: object = {}
): object => {
  return {
    $type,
    $designer: {
      id: nanoid('1234567890', 6),
      ...designerAttributes,
    },
    ...seedDefaults($type),
    ...(initialDialogShape[$type] || {}),
    ...optionalAttributes,
  };
};
