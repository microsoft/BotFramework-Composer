import { SDKTypes, PROMPT_TYPES } from 'shared';
import { UiSchema } from '@bfcomposer/react-jsonschema-form';

const globalHidden = ['property', 'id'];

const promptFieldsSchemas = PROMPT_TYPES.reduce((schemas, type) => {
  schemas[type] = {
    'ui:field': 'PromptField',
  };
  return schemas;
}, {});

const triggerUiSchema = {
  actions: {
    'ui:field': 'StepsField',
  },
  'ui:order': ['condition', '*', 'actions'],
  'ui:hidden': [...globalHidden],
};

export const uiSchema: { [key in SDKTypes]?: UiSchema } = {
  [SDKTypes.AdaptiveDialog]: {
    recognizer: {
      'ui:field': 'RecognizerField',
    },
    triggers: {
      'ui:field': 'RulesField',
    },
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['recognizer', 'triggers', '*'],
    'ui:hidden': ['autoEndDialog', 'generator', ...globalHidden],
  },
  [SDKTypes.BeginDialog]: {
    dialog: {
      'ui:widget': 'DialogSelectWidget',
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
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['itemsProperty', 'actions', '*'],
  },
  [SDKTypes.ForeachPage]: {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['itemsProperty', 'pageSize', 'actions', '*'],
  },
  [SDKTypes.HttpRequest]: {
    body: {
      'ui:field': 'JsonField',
    },
    'ui:order': ['method', 'url', 'body', 'property', 'responseTypes', 'headers', '*'],
  },
  [SDKTypes.IfCondition]: {
    actions: {
      'ui:field': 'StepsField',
    },
    elseActions: {
      'ui:field': 'StepsField',
    },
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.OnActivity]: {
    ...triggerUiSchema,
  },
  [SDKTypes.OnBeginDialog]: {
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
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['intent', 'condition', 'entities', '*'],
    'ui:hidden': [...globalHidden],
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
  },
  [SDKTypes.ReplaceDialog]: {
    dialog: {
      'ui:widget': 'DialogSelectWidget',
    },
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.SwitchCondition]: {
    cases: {
      'ui:field': 'CasesField',
    },
    default: {
      'ui:field': 'StepsField',
    },
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.SendActivity]: {
    activity: {
      'ui:field': 'LgEditorField',
    },
    'ui:hidden': [...globalHidden],
  },
  ...promptFieldsSchemas,
};
