// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UISchema } from '@bfc/extension';
import { SDKTypes } from '@bfc/shared';

import { EditableField } from './components/fields';

const globalHiddenProperties = ['$type', '$id', '$copy', '$designer', 'id'];
const triggerUiSchema = {
  'ui:order': ['condition', '*'],
  'ui:hidden': ['actions', ...globalHiddenProperties],
};

const DefaultUISchema: UISchema = {
  [SDKTypes.AdaptiveDialog]: {
    'ui:order': ['recognizer', '*'],
    'ui:hidden': ['triggers', 'autoEndDialog', 'generator', 'selector', ...globalHiddenProperties],
    properties: {
      recognizer: {
        'ui:hidden': ['entities'],
        properties: {
          intents: {
            properties: {
              intent: {
                'ui:label': false,
                'ui:field': EditableField,
              },
              pattern: {
                'ui:label': false,
                'ui:field': EditableField,
              },
            },
          },
        },
      },
    },
  },
  [SDKTypes.BeginDialog]: {
    'ui:order': ['dialog', 'options', 'resultProperty', 'includeActivity', '*'],
    // properties: {
    // dialog: {
    //   'ui:widget': 'DialogSelectWidget',
    // },
    // options: {
    //   'ui:field': 'CustomObjectField',
    // },
    // },
  },
  [SDKTypes.CancelAllDialogs]: {
    'ui:order': ['dialog', 'property', '*'],
    // properties: {
    //   eventValue: {
    //     'ui:field': 'CustomObjectField',
    //   },
    // },
  },
  [SDKTypes.ConditionalSelector]: {
    'ui:hidden': [...globalHiddenProperties],
    // properties: {
    //   ifFalse: {
    //     'ui:field': 'SelectorField',
    //   },
    //   ifTrue: {
    //     'ui:field': 'SelectorField',
    //   },
    // },
  },
  [SDKTypes.EditActions]: {
    // properties: {
    //   actions: {
    //     'ui:field': 'StepsField',
    //   },
    // },
  },
  [SDKTypes.Foreach]: {
    'ui:order': ['itemsProperty', '*'],
    'ui:hidden': ['actions'],
  },
  [SDKTypes.ForeachPage]: {
    'ui:order': ['itemsProperty', 'pageSize', '*'],
    'ui:hidden': ['actions'],
  },
  [SDKTypes.HttpRequest]: {
    'ui:order': ['method', 'url', 'body', 'headers', '*'],
    // properties: {
    //   body: {
    //     // 'ui:field': 'JsonField',
    //   },
    //   headers: {
    //     // 'ui:field': 'CustomObjectField',
    //   },
    // },
  },
  [SDKTypes.IfCondition]: {
    'ui:hidden': ['actions', 'elseActions', ...globalHiddenProperties],
  },
  [SDKTypes.SetProperties]: {
    // 'ui:field': 'AssignmentsField',
    // properties: {
    //   assignments: {
    //     'ui:options': {
    //       hideLabel: true,
    //       transparentBorder: true,
    //     },
    //   },
    // },
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
    'ui:order': ['intent', 'condition', 'entities', '*'],
    'ui:hidden': ['actions', ...globalHiddenProperties],
    // properties: {
    //   intent: {
    //     'ui:widget': 'IntentWidget',
    //   },
    // },
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
    'ui:hidden': [...globalHiddenProperties],
    // properties: {
    //   selector: {
    //     // 'ui:field': 'SelectorField',
    //   },
    // },
  },
  [SDKTypes.OAuthInput]: {
    'ui:order': ['connectionName', '*'],
    // properties: {
    //   prompt: {
    //     'ui:widget': 'TextareaWidget',
    //   },
    //   unrecognizedPrompt: {
    //     'ui:widget': 'TextareaWidget',
    //   },
    //   invalidPrompt: {
    //     'ui:widget': 'TextareaWidget',
    //   },
    // },
  },
  [SDKTypes.ReplaceDialog]: {
    'ui:hidden': [...globalHiddenProperties],
    'ui:order': ['dialog', 'options', 'includeActivity', '*'],
    // properties: {
    //   dialog: {
    //     'ui:widget': 'DialogSelectWidget',
    //   },
    //   options: {
    //     // 'ui:field': 'CustomObjectField',
    //   },
    // },
  },
  [SDKTypes.RepeatDialog]: {
    'ui:hidden': [...globalHiddenProperties],
    'ui:order': ['options', 'includeActivity', '*'],
    // properties: {
    //   options: {
    //     // 'ui:field': 'CustomObjectField',
    //   },
    // },
  },
  [SDKTypes.SwitchCondition]: {
    'ui:hidden': ['default', ...globalHiddenProperties],
    properties: {
      cases: {
        'ui:hidden': ['actions'],
      },
    },
  },
  [SDKTypes.SendActivity]: {
    'ui:hidden': [...globalHiddenProperties],
    // properties: {
    //   activity: {
    //     // 'ui:field': 'LgEditorField',
    //   },
    // },
  },
};

export default DefaultUISchema;
