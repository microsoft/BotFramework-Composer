// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKTypes, PROMPT_TYPES } from '@bfc/shared';
import { UiSchema } from '@bfcomposer/react-jsonschema-form';

const globalHidden = ['property', 'id'];

const promptFieldsSchemas = PROMPT_TYPES.reduce((schemas, type) => {
  schemas[type] = {
    'ui:field': 'PromptField',
  };
  return schemas;
}, {});

const triggerUiSchema = {
  'ui:order': ['condition', '*'],
  'ui:hidden': ['actions', ...globalHidden],
};

export const uiSchema: { [key in SDKTypes]?: UiSchema } = {
  [SDKTypes.AdaptiveDialog]: {
    recognizer: {
      'ui:field': 'RecognizerField',
      intents: {
        'ui:options': {
          object: true,
        },
        items: {
          'ui:options': {
            hideDescription: true,
            inline: true,
          },
          intent: {
            'ui:options': {
              hideLabel: true,
              transparentBorder: true,
            },
          },
          pattern: {
            'ui:options': {
              hideLabel: true,
              transparentBorder: true,
            },
          },
        },
      },
      entities: {
        items: {
          'ui:options': {
            displayLabel: false,
            hideLabel: true,
            hideDescription: true,
          },
        },
      },
    },
    'ui:order': ['recognizer', 'triggers', '*'],
    'ui:hidden': ['triggers', 'autoEndDialog', 'generator', ...globalHidden],
  },
  [SDKTypes.BeginDialog]: {
    dialog: {
      'ui:widget': 'DialogSelectWidget',
    },
    options: {
      'ui:field': 'CustomObjectField',
    },
    'ui:order': ['dialog', 'options', 'resultProperty', 'includeActivity', '*'],
  },
  [SDKTypes.CancelAllDialogs]: {
    eventValue: {
      'ui:field': 'CustomObjectField',
    },
    'ui:order': ['dialog', 'property', '*'],
  },
  [SDKTypes.ConditionalSelector]: {
    ifFalse: {
      'ui:field': 'SelectorField',
    },
    ifTrue: {
      'ui:field': 'SelectorField',
    },
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.EditActions]: {
    actions: {
      'ui:field': 'StepsField',
    },
  },
  [SDKTypes.Foreach]: {
    'ui:order': ['itemsProperty', 'actions', '*'],
    'ui:hidden': ['actions'],
  },
  [SDKTypes.ForeachPage]: {
    'ui:order': ['itemsProperty', 'pageSize', 'actions', '*'],
    'ui:hidden': ['actions'],
  },
  [SDKTypes.HttpRequest]: {
    body: {
      'ui:field': 'JsonField',
    },
    headers: {
      'ui:field': 'CustomObjectField',
    },
    'ui:order': ['method', 'url', 'body', 'property', 'responseTypes', 'headers', '*'],
  },
  [SDKTypes.IfCondition]: {
    'ui:hidden': ['actions', 'elseActions', ...globalHidden],
  },
  [SDKTypes.SetProperties]: {
    assignments: {
      'ui:options': {
        hideLabel: true,
        transparentBorder: true,
      },
      'ui:field': 'AssignmentsField',
    },
  },
  [SDKTypes.OnActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnBeginDialog]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnCancelDialog]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnCondition]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnConversationUpdateActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnCustomEvent]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnDialogEvent]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnEndOfConversationActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnError]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnEventActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnHandoffActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnIntent]: {
    intent: {
      'ui:widget': 'IntentWidget',
    },
    'ui:order': ['condition', 'entities', 'intent', '*'],
    'ui:hidden': ['actions', ...globalHidden],
  },
  [SDKTypes.OnInvokeActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnMessageActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnMessageDeleteActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnMessageReactionActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnMessageUpdateActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnRepromptDialog]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnTypingActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnUnknownIntent]: {
    ...triggerUiSchema,
  },
  [SDKTypes.MostSpecificSelector]: {
    selector: {
      'ui:field': 'SelectorField',
    },
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.OAuthInput]: {
    prompt: {
      'ui:widget': 'TextareaWidget',
    },
    unrecognizedPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    invalidPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    'ui:order': ['connectionName', '*'],
    'ui:hidden': ['alwaysPrompt'],
  },
  [SDKTypes.QnAMakerDialog]: {
    strictFilters: {
      'ui:options': {
        object: true,
      },
      items: {
        'ui:options': {
          hideDescription: true,
          inline: true,
        },
        name: {
          'ui:options': {
            hideLabel: true,
            transparentBorder: true,
          },
        },
        value: {
          'ui:options': {
            hideLabel: true,
            transparentBorder: true,
          },
        },
      },
    },
  },
  [SDKTypes.ReplaceDialog]: {
    dialog: {
      'ui:widget': 'DialogSelectWidget',
    },
    options: {
      'ui:field': 'CustomObjectField',
    },
    'ui:hidden': [...globalHidden],
    'ui:order': ['dialog', 'options', 'includeActivity', '*'],
  },
  [SDKTypes.RepeatDialog]: {
    options: {
      'ui:field': 'CustomObjectField',
    },
    'ui:hidden': [...globalHidden],
    'ui:order': ['options', 'includeActivity', '*'],
  },
  [SDKTypes.SwitchCondition]: {
    cases: {
      'ui:options': {
        object: true,
      },
      items: {
        'ui:hidden': ['actions'],
        'ui:options': {
          hideDescription: true,
          inline: true,
        },
        value: {
          'ui:options': {
            hideLabel: true,
            transparentBorder: true,
          },
        },
      },
    },
    'ui:hidden': ['default', ...globalHidden],
  },
  [SDKTypes.SendActivity]: {
    activity: {
      'ui:field': 'LgEditorField',
    },
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.SkillDialog]: {
    activity: {
      'ui:field': 'LgEditorField',
      'ui:title': 'Activity',
    },
    'ui:hidden': [...globalHidden],
    'ui:order': [
      'botId',
      'skillEndpoint',
      'skillHostEndpoint',
      'skillAppId',
      'activity',
      'activityProcessed',
      'resultProperty',
      '*',
    ],
  },
  ...promptFieldsSchemas,
};
