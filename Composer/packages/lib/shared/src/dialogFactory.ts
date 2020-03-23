// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import nanoid from 'nanoid/generate';

import { DesignerData } from './types/sdk';
import { appschema } from './appschema';
import { copyAdaptiveAction } from './copyUtils';
import { deleteAdaptiveAction, deleteAdaptiveActionList } from './deleteUtils';
import { MicrosoftIDialog } from './types';
import { SDKTypes } from './types';
import { ExternalResourceHandlerAsync } from './copyUtils/ExternalApi';

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
  [SDKTypes.AdaptiveDialog]: seededActions => ({
    $type: SDKTypes.AdaptiveDialog,
    triggers: [
      {
        $type: SDKTypes.OnBeginDialog,
        ...getNewDesigner('BeginDialog', ''),
        actions: [...seededActions],
      },
    ],
  }),
  [SDKTypes.OnConversationUpdateActivity]: {
    $type: SDKTypes.OnConversationUpdateActivity,
    actions: [
      {
        $type: SDKTypes.Foreach,
        ...getNewDesigner('Loop: for each item', ''),
        itemsProperty: 'turn.Activity.membersAdded',
        actions: [
          {
            $type: SDKTypes.IfCondition,
            ...getNewDesigner('Branch: if/else', ''),
            condition: 'string(dialog.foreach.value.id) != string(turn.Activity.Recipient.id)',
            actions: [
              {
                $type: SDKTypes.SendActivity,
                ...getNewDesigner('Send a response', ''),
                activity: '',
              },
            ],
          },
        ],
      },
    ],
  },
  [SDKTypes.SendActivity]: {
    activity: '',
  },
  [SDKTypes.AttachmentInput]: initialInputDialog,
  [SDKTypes.ChoiceInput]: initialInputDialog,
  [SDKTypes.ConfirmInput]: initialInputDialog,
  [SDKTypes.DateTimeInput]: initialInputDialog,
  [SDKTypes.NumberInput]: initialInputDialog,
  [SDKTypes.TextInput]: initialInputDialog,
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

export const deepCopyAction = async (data, copyLgTemplate: ExternalResourceHandlerAsync<string>) => {
  return await copyAdaptiveAction(data, {
    getDesignerId,
    transformLgField: copyLgTemplate,
  });
};

export const deepCopyActions = async (actions: any[], copyLgTemplate: ExternalResourceHandlerAsync<string>) => {
  // NOTES: underlying lg api for writing new lg template to file is not concurrency-safe,
  //        so we have to call them sequentially
  // TODO: copy them parralleled via Promise.all() after optimizing lg api.
  const copiedActions: any[] = [];
  for (const action of actions) {
    // Deep copy nodes with external resources
    const copy = await deepCopyAction(action, copyLgTemplate);
    copiedActions.push(copy);
  }
  return copiedActions;
};

export const deleteAction = (
  data: MicrosoftIDialog,
  deleteLgTemplates: (templates: string[]) => any,
  deleteLuIntents: (luIntents: string[]) => any
) => {
  return deleteAdaptiveAction(data, deleteLgTemplates, deleteLuIntents);
};

export const deleteActions = (
  inputs: MicrosoftIDialog[],
  deleteLgTemplates: (templates: string[]) => any,
  deleteLuIntents: (luIntents: string[]) => any
) => {
  return deleteAdaptiveActionList(inputs, deleteLgTemplates, deleteLuIntents);
};

const seedInitialDialogShape = ($type: string, seededParams?) => {
  const shape = initialDialogShape[$type];
  if (typeof shape === 'function' && seededParams !== undefined) {
    return shape(seededParams) || {};
  }
  return shape || {};
};

export const seedNewDialog = (
  $type: string,
  designerAttributes: Partial<DesignerAttributes> = {},
  optionalAttributes: object = {},
  seededParams?: object
): object => {
  return {
    $type,
    $designer: {
      id: nanoid('1234567890', 6),
      ...designerAttributes,
    },
    ...seedDefaults($type),
    ...seedInitialDialogShape($type, seededParams),
    ...optionalAttributes,
  };
};
