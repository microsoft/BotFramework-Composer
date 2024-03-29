// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7 } from 'json-schema';
import merge from 'lodash/merge';
import formatMessage from 'format-message';
import { DesignerData, MicrosoftIDialog, LuIntentSection, SDKKinds, BaseSchema } from '@botframework-composer/types';

import { copyAdaptiveAction } from './copyUtils';
import { deleteAdaptiveAction, deleteAdaptiveActionList } from './deleteUtils';
import { FieldProcessorAsync } from './copyUtils/ExternalApi';
import { generateDesignerId } from './generateUniqueId';
import { conceptLabels } from './labelMap';
import { chooseIntentTemplatePrefix } from './constant';

interface DesignerAttributes {
  name: string;
  comment: string;
}

const initialInputDialog = {
  allowInterruptions: false,
  prompt: '',
  unrecognizedPrompt: '',
  invalidPrompt: '',
  defaultValueResponse: '',
};

export function getFriendlyName(data: BaseSchema, isDialog = false): string {
  if (!data) return '';
  if (data.$designer?.name !== undefined) {
    return data.$designer?.name;
  }

  if (isDialog) {
    return data.id;
  }

  if (data.intent) {
    return `${data.intent}`;
  }

  return conceptLabels()[data.$kind]?.title ?? data.$kind;
}

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
        ...getNewDesigner(formatMessage('Loop: For each item'), ''),
        itemsProperty: 'turn.Activity.membersAdded',
        actions: [
          {
            $kind: SDKKinds.IfCondition,
            ...getNewDesigner(formatMessage('Branch: If/else'), ''),
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
  [SDKKinds.BeginSkill]: {
    botId: '=settings.MicrosoftAppId',
    skillHostEndpoint: '=settings.skillHostEndpoint',
    connectionName: '=settings.connectionName',
    allowInterruptions: false,
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
            property: 'turn.minThreshold',
            value: 0.5,
          },
          {
            property: 'turn.maxChoices',
            value: 3,
          },
          {
            property: 'conversation.lastAmbiguousUtterance',
            value: '=turn.activity.text',
          },
          {
            property: 'dialog.candidates',
            value:
              '=take(sortByDescending(where(flatten(select(turn.recognized.candidates, x, if (x.intent=="ChooseIntent", x.result.candidates, x))), c, not(startsWith(c.intent, "DeferToRecognizer_QnA")) && c.score > turn.minThreshold), \'score\'), turn.maxChoices)',
          },
        ],
      },
      {
        $kind: SDKKinds.SwitchCondition,
        $designer: {
          id: generateDesignerId(),
        },
        condition: '=string(count(dialog.candidates))',
        cases: [
          {
            value: '0',
            actions: [
              {
                $kind: SDKKinds.EmitEvent,
                $designer: {
                  id: generateDesignerId(),
                },
                eventName: 'unknownIntent',
              },
              {
                $kind: SDKKinds.EndDialog,
                $designer: {
                  id: generateDesignerId(),
                },
              },
            ],
          },
          {
            value: '1',
            actions: [
              {
                $kind: SDKKinds.EmitEvent,
                $designer: {
                  id: generateDesignerId(),
                },
                eventName: 'recognizedIntent',
                eventValue: '=first(dialog.candidates).result',
              },
              {
                $kind: SDKKinds.EndDialog,
                $designer: {
                  id: generateDesignerId(),
                },
              },
            ],
          },
        ],
      },
      {
        $kind: SDKKinds.TextInput,
        $designer: {
          id: generateDesignerId(),
        },
        maxTurnCount: 3,
        alwaysPrompt: true,
        allowInterruptions: false,
        prompt: `\${${chooseIntentTemplatePrefix}_${generateDesignerId()}()}`,
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
            eventValue: '=dialog.candidates[int(turn.intentChoice)].result',
          },
        ],
        elseActions: [
          {
            $kind: SDKKinds.SendActivity,
            $designer: {
              id: generateDesignerId(),
            },
            activity: `\${${chooseIntentTemplatePrefix}_SendActivity_${generateDesignerId()}()}`,
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
  data: MicrosoftIDialog,
  copyLgTemplate: FieldProcessorAsync<string>,
  copyLuIntent: FieldProcessorAsync<LuIntentSection | string | undefined>,
) => {
  return await copyAdaptiveAction(data, {
    getDesignerId,
    copyLgField: copyLgTemplate,
    copyLuField: copyLuIntent,
  });
};

export const deepCopyActions = async (
  actions: MicrosoftIDialog[],
  copyLgTemplate: FieldProcessorAsync<string>,
  copyLuIntent: FieldProcessorAsync<LuIntentSection | string | undefined>,
) => {
  // NOTES: underlying lg api for writing new lg template to file is not concurrency-safe,
  //        so we have to call them sequentially
  // TODO: copy them parralleled via Promise.all() after optimizing lg api.
  const copiedActions: MicrosoftIDialog[] = [];
  for (const action of actions) {
    // Deep copy nodes with external resources
    const copy = await deepCopyAction(action, copyLgTemplate, copyLuIntent);
    copiedActions.push(copy);
  }
  return copiedActions;
};

export const deleteAction = (
  data: MicrosoftIDialog,
  deleteLgTemplates: (templates: string[]) => Promise<any>,
  deleteLuIntents: (luIntents: string[]) => Promise<any>,
) => {
  return deleteAdaptiveAction(data, deleteLgTemplates, deleteLuIntents);
};

export const deleteActions = (
  inputs: MicrosoftIDialog[],
  deleteLgTemplates: (templates: string[]) => Promise<any>,
  deleteLuIntents: (luIntents: string[]) => Promise<any>,
) => {
  return deleteAdaptiveActionList(inputs, deleteLgTemplates, deleteLuIntents);
};

const assignDefaults = (data: Record<string, any>, currentSeed = {}) => {
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
    } = {},
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
      propertyOverrides,
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
