// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7 } from 'json-schema';
import merge from 'lodash/merge';

import { DesignerData } from './types/sdk';
import { copyAdaptiveAction } from './copyUtils';
import { deleteAdaptiveAction, deleteAdaptiveActionList } from './deleteUtils';
import { MicrosoftIDialog, LuIntentSection } from './types';
import { SDKKinds } from './types';
import { ExternalResourceHandlerAsync } from './copyUtils/ExternalApi';
import { generateUniqueId } from './generateUniqueId';

interface DesignerAttributes {
  name: string;
  description: string;
}

const initialInputDialog = {
  allowInterruptions: false,
  prompt: '',
  unrecognizedPrompt: '',
  invalidPrompt: '',
  defaultValueResponse: '',
};

export function getNewDesigner(name: string, description: string) {
  return {
    $designer: {
      name,
      description,
      id: generateUniqueId(6),
    },
  };
}

const initialDialogShape = () => ({
  [SDKKinds.AdaptiveDialog]: {
    $kind: SDKKinds.AdaptiveDialog,
    triggers: [
      {
        $kind: SDKKinds.OnBeginDialog,
        ...getNewDesigner('BeginDialog', ''),
      },
    ],
  },
  [SDKKinds.OnConversationUpdateActivity]: {
    $kind: SDKKinds.OnConversationUpdateActivity,
    actions: [
      {
        $kind: SDKKinds.Foreach,
        ...getNewDesigner('Loop: for each item', ''),
        itemsProperty: 'turn.Activity.membersAdded',
        actions: [
          {
            $kind: SDKKinds.IfCondition,
            ...getNewDesigner('Branch: if/else', ''),
            condition: 'string(dialog.foreach.value.id) != string(turn.Activity.Recipient.id)',
            actions: [
              {
                $kind: SDKKinds.SendActivity,
                ...getNewDesigner('Send a response', ''),
                activity: '',
              },
            ],
          },
        ],
      },
    ],
  },
  [SDKKinds.SendActivity]: {
    activity: '',
  },
  [SDKKinds.AttachmentInput]: initialInputDialog,
  [SDKKinds.ChoiceInput]: initialInputDialog,
  [SDKKinds.ConfirmInput]: initialInputDialog,
  [SDKKinds.DateTimeInput]: initialInputDialog,
  [SDKKinds.NumberInput]: initialInputDialog,
  [SDKKinds.TextInput]: initialInputDialog,
});

export const getDesignerId = (data?: DesignerData) => {
  const newDesigner: DesignerData = {
    ...data,
    id: generateUniqueId(6),
  };

  return newDesigner;
};

export const deepCopyAction = async (
  data,
  copyLgTemplate: ExternalResourceHandlerAsync<string>,
  copyLuIntent: ExternalResourceHandlerAsync<LuIntentSection | undefined>
) => {
  return await copyAdaptiveAction(data, {
    getDesignerId,
    transformLgField: copyLgTemplate,
    transformLuField: copyLuIntent,
  });
};

export const deepCopyActions = async (
  actions: any[],
  copyLgTemplate: ExternalResourceHandlerAsync<string>,
  copyLuIntent: ExternalResourceHandlerAsync<LuIntentSection | undefined>
) => {
  // NOTES: underlying lg api for writing new lg template to file is not concurrency-safe,
  //        so we have to call them sequentially
  // TODO: copy them parralleled via Promise.all() after optimizing lg api.
  const copiedActions: any[] = [];
  for (const action of actions) {
    // Deep copy nodes with external resources
    const copy = await deepCopyAction(action, copyLgTemplate, copyLuIntent);
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

class DialogFactory {
  private schema: JSONSchema7 | undefined;

  public constructor(schema?: JSONSchema7) {
    this.schema = schema;
  }

  public create(
    $kind: SDKKinds,
    overrides: {
      $designer?: Partial<DesignerAttributes>;
      [key: string]: any;
    } = {}
  ) {
    if (!this.schema) {
      throw new Error('DialogFactory missing schema.');
    }

    const { $designer, ...propertyOverrides } = overrides;
    const defaultProperties = initialDialogShape()[$kind] || {};

    return merge(
      { $kind, $designer: merge({ id: generateUniqueId(6) }, $designer) },
      this.seedDefaults($kind),
      defaultProperties,
      propertyOverrides
    );
  }

  private seedDefaults($kind: SDKKinds) {
    if (!this.schema?.definitions?.[$kind]) return {};
    const def = this.schema.definitions[$kind];

    if (def && typeof def === 'object' && def.properties) {
      return assignDefaults(def.properties);
    }

    return {};
  }
}

export { DialogFactory };
