// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7 } from 'json-schema';
import merge from 'lodash/merge';
import formatMessage from 'format-message';
import { DesignerData, MicrosoftIDialog, LuIntentSection, SDKKinds } from '@bfc/types';

import { copyAdaptiveAction } from './copyUtils';
import { deleteAdaptiveAction, deleteAdaptiveActionList } from './deleteUtils';
import { FieldProcessorAsync } from './copyUtils/ExternalApi';
import { generateDesignerId } from './generateUniqueId';

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
      id: generateDesignerId(),
    },
  };
}

const initialDialogShape = () => ({
  [SDKKinds.AdaptiveDialog]: {
    $kind: SDKKinds.AdaptiveDialog,
    triggers: [
      {
        $kind: SDKKinds.OnBeginDialog,
        ...getNewDesigner(formatMessage('BeginDialog'), ''),
      },
    ],
  },
  [SDKKinds.OnConversationUpdateActivity]: {
    $kind: SDKKinds.OnConversationUpdateActivity,
    actions: [
      {
        $kind: SDKKinds.Foreach,
        ...getNewDesigner(formatMessage('Loop: for each item'), ''),
        itemsProperty: 'turn.Activity.membersAdded',
        actions: [
          {
            $kind: SDKKinds.IfCondition,
            ...getNewDesigner(formatMessage('Branch: if/else'), ''),
            condition: 'string(dialog.foreach.value.id) != string(turn.Activity.Recipient.id)',
            actions: [
              {
                $kind: SDKKinds.SendActivity,
                ...getNewDesigner(formatMessage('Send a response'), ''),
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
  [SDKKinds.OnQnAMatch]: {
    $kind: SDKKinds.OnQnAMatch,
    $designer: {
      id: generateDesignerId(),
    },
    actions: [
      {
        $kind: SDKKinds.IfCondition,
        $designer: {
          id: generateDesignerId(),
        },
        condition: 'count(turn.recognized.answers[0].context.prompts) > 0',
        actions: [
          {
            $kind: SDKKinds.SetProperty,
            $designer: {
              id: generateDesignerId(),
            },
            property: 'dialog.qnaContext',
            value: '=turn.recognized.answers[0].context.prompts',
          },
          {
            $kind: SDKKinds.TextInput,
            $designer: {
              id: generateDesignerId(),
            },
            maxTurnCount: 3,
            alwaysPrompt: true,
            allowInterruptions: false,
            prompt: `\${TextInput_Prompt_${generateDesignerId()}()}`,
            property: 'turn.qnaMultiTurnResponse',
          },
          {
            $kind: SDKKinds.SetProperty,
            $designer: {
              id: generateDesignerId(),
            },
            property: 'turn.qnaMatchFromContext',
            value: '=where(dialog.qnaContext, item, item.displayText == turn.qnaMultiTurnResponse)',
          },
          {
            $kind: SDKKinds.DeleteProperty,
            $designer: {
              id: generateDesignerId(),
            },
            property: 'dialog.qnaContext',
          },
          {
            $kind: SDKKinds.IfCondition,
            $designer: {
              id: generateDesignerId(),
            },
            condition: 'turn.qnaMatchFromContext && count(turn.qnaMatchFromContext) > 0',
            actions: [
              {
                $kind: SDKKinds.SetProperty,
                $designer: {
                  id: generateDesignerId(),
                },
                property: 'turn.qnaIdFromPrompt',
                value: '=turn.qnaMatchFromContext[0].qnaId',
              },
            ],
          },
          {
            $kind: SDKKinds.EmitEvent,
            $designer: {
              id: generateDesignerId(),
            },
            eventName: 'activityReceived',
            eventValue: '=turn.activity',
          },
        ],
        elseActions: [
          {
            $kind: SDKKinds.SendActivity,
            $designer: {
              id: generateDesignerId(),
            },
            activity: `\${SendActivity_${generateDesignerId()}()}`,
          },
        ],
      },
    ],
  },
  [SDKKinds.OnChooseIntent]: {
    $kind: SDKKinds.OnChooseIntent,
    $designer: {
      id: generateDesignerId(),
    },
    actions: [
      {
        $kind: SDKKinds.SetProperties,
        $designer: {
          id: generateDesignerId(),
        },
        assignments: [
          {
            value: '=turn.recognized.candidates[0]',
            property: 'dialog.luisResult',
          },
          {
            property: 'dialog.qnaResult',
            value: '=turn.recognized.candidates[1]',
          },
        ],
      },
      {
        $kind: SDKKinds.IfCondition,
        $designer: {
          id: generateDesignerId(),
        },
        condition: 'dialog.luisResult.score >= 0.9 && dialog.qnaResult.score <= 0.5',
        actions: [
          {
            $kind: SDKKinds.EmitEvent,
            $designer: {
              id: generateDesignerId(),
            },
            eventName: 'recognizedIntent',
            eventValue: '=dialog.luisResult.result',
          },
          {
            $kind: SDKKinds.BreakLoop,
            $designer: {
              id: generateDesignerId(),
            },
          },
        ],
      },
      {
        $kind: SDKKinds.IfCondition,
        $designer: {
          id: generateDesignerId(),
        },
        condition: 'dialog.luisResult.score <= 0.5 && dialog.qnaResult.score >= 0.9',
        actions: [
          {
            $kind: SDKKinds.EmitEvent,
            $designer: {
              id: generateDesignerId(),
            },
            eventName: 'recognizedIntent',
            eventValue: '=dialog.qnaResult.result',
          },
          {
            $kind: SDKKinds.BreakLoop,
            $designer: {
              id: generateDesignerId(),
            },
          },
        ],
      },
      {
        $kind: SDKKinds.IfCondition,
        $designer: {
          id: generateDesignerId(),
        },
        condition: 'dialog.qnaResult.score <= 0.05',
        actions: [
          {
            $kind: SDKKinds.EmitEvent,
            $designer: {
              id: generateDesignerId(),
            },
            eventName: 'recognizedIntent',
            eventValue: '=dialog.luisResult.result',
          },
          {
            $kind: SDKKinds.BreakLoop,
            $designer: {
              id: generateDesignerId(),
            },
          },
        ],
        top: 3,
        cardNoMatchResponse: 'Thanks for the feedback.',
        cardNoMatchText: 'None of the above.',
      },
      {
        $kind: SDKKinds.TextInput,
        $designer: {
          id: generateDesignerId(),
        },
        maxTurnCount: 3,
        alwaysPrompt: true,
        allowInterruptions: false,
        prompt: `\${TextInput_Prompt_${generateDesignerId()}()}`,
        property: 'turn.intentChoice',
        value: '=@userChosenIntent',
        top: 3,
        cardNoMatchResponse: 'Thanks for the feedback.',
        cardNoMatchText: 'None of the above.',
        activeLearningCardTitle: 'Did you mean:',
        threshold: 0.3,
        noAnswer: 'Sorry, I did not find an answer.',
        hostname: '=settings.qna.hostname',
        endpointKey: '=settings.qna.endpointkey',
        knowledgeBaseId: '=settings.qna.knowledgebaseid',
      },
      {
        $kind: SDKKinds.IfCondition,
        $designer: {
          id: generateDesignerId(),
        },
        condition: "turn.intentChoice != 'none'",
        actions: [
          {
            $kind: SDKKinds.EmitEvent,
            $designer: {
              id: generateDesignerId(),
            },
            eventName: 'recognizedIntent',
            eventValue: '=dialog[turn.intentChoice].result',
          },
        ],
        elseActions: [
          {
            $kind: SDKKinds.SendActivity,
            $designer: {
              id: generateDesignerId(),
            },
            activity: `\${SendActivity_${generateDesignerId()}()}`,
          },
        ],
        top: 3,
        cardNoMatchResponse: 'Thanks for the feedback.',
        cardNoMatchText: 'None of the above.',
        activeLearningCardTitle: 'Did you mean:',
        threshold: 0.3,
        noAnswer: 'Sorry, I did not find an answer.',
        hostname: '=settings.qna.hostname',
        endpointKey: '=settings.qna.endpointkey',
        knowledgeBaseId: '=settings.qna.knowledgebaseid',
      },
    ],
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
    id: generateDesignerId(),
  };

  return newDesigner;
};

export const deepCopyAction = async (
  data,
  copyLgTemplate: FieldProcessorAsync<string>,
  copyLuIntent: FieldProcessorAsync<LuIntentSection | string | undefined>
) => {
  return await copyAdaptiveAction(data, {
    getDesignerId,
    copyLgField: copyLgTemplate,
    copyLuField: copyLuIntent,
  });
};

export const deepCopyActions = async (
  actions: any[],
  copyLgTemplate: FieldProcessorAsync<string>,
  copyLuIntent: FieldProcessorAsync<LuIntentSection | string | undefined>
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
      throw new Error(formatMessage('DialogFactory missing schema.'));
    }

    const { $designer, ...propertyOverrides } = overrides;
    const defaultProperties = initialDialogShape()[$kind] || {};
    return merge(
      { $kind, $designer: merge({ id: generateDesignerId() }, $designer) },
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
