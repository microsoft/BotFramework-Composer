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
  'ui:order': ['condition', '*'],
  'ui:hidden': ['actions', ...globalHidden],
};

export const uiSchema: { [key in SDKTypes]?: UiSchema } = {
  [SDKTypes.AdaptiveDialog]: {
    recognizer: {
      'ui:field': 'RecognizerField',
    },
    'ui:order': ['recognizer', 'triggers', '*'],
    'ui:hidden': ['triggers', 'autoEndDialog', 'generator', ...globalHidden],
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
    'ui:order': ['method', 'url', 'body', 'property', 'responseTypes', 'headers', '*'],
  },
  [SDKTypes.IfCondition]: {
    'ui:hidden': ['actions', 'elseActions', ...globalHidden],
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
    'ui:order': ['intent', 'condition', 'entities', '*'],
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
    'ui:hidden': ['default', ...globalHidden],
  },
  [SDKTypes.SendActivity]: {
    activity: {
      'ui:field': 'LgEditorField',
    },
    'ui:hidden': [...globalHidden],
  },
  ...promptFieldsSchemas,
};
