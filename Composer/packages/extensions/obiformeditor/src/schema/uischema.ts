import { SDKTypes } from 'shared-menus';
import { UiSchema } from '@bfcomposer/react-jsonschema-form';

const globalHidden = ['property', 'inputBindings', 'outputBinding', 'id', 'tags'];

const activityFields = {
  prompt: {
    'ui:widget': 'TextareaWidget',
  },
  unrecognizedPrompt: {
    'ui:widget': 'TextareaWidget',
  },
  invalidPrompt: {
    'ui:widget': 'TextareaWidget',
  },
  'ui:hidden': ['id', 'tags', 'value', 'inputBindings', 'outputBinding'],
};

export const uiSchema: { [key in SDKTypes]?: UiSchema } = {
  [SDKTypes.AdaptiveDialog]: {
    recognizer: {
      'ui:field': 'RecognizerField',
    },
    events: {
      'ui:field': 'RulesField',
    },
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['property', 'outputBinding', 'recognizer', 'events', '*'],
    'ui:hidden': ['autoEndDialog', 'generator', ...globalHidden],
  },
  [SDKTypes.BeginDialog]: {
    dialog: {
      'ui:widget': 'DialogSelectWidget',
    },
    'ui:hidden': ['inputBindings', 'outputBinding'],
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
    'ui:order': ['listProperty', 'valueProperty', 'indexProperty', 'actions', '*'],
  },
  [SDKTypes.ForeachPage]: {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['listProperty', 'pageSize', 'valueProperty', 'actions', '*'],
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
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.OnBeginDialog]: {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.OnConversationUpdateActivity]: {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.OnDialogEvent]: {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['events', 'constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.OnEndOfConversationActivity]: {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.OnEvent]: {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.OnEventActivity]: {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.OnHandoffActivity]: {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.OnIntent]: {
    intent: {
      'ui:widget': 'IntentWidget',
    },
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['intent', 'constraint', 'entities', '*'],
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.OnInvokeActivity]: {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.OnMessageActivity]: {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.OnMessageDeleteActivity]: {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.OnMessageReactionActivity]: {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.OnMessageUpdateActivity]: {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.OnTypingActivity]: {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.OnUnknownIntent]: {
    actions: {
      'ui:field': 'StepsField',
    },
    'ui:order': ['constraint', '*', 'actions'],
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.MostSpecificSelector]: {
    selector: {
      'ui:field': 'SelectorField',
    },
    'ui:hidden': [...globalHidden],
  },
  [SDKTypes.TextInput]: {
    prompt: {
      'ui:widget': 'TextareaWidget',
    },
    unrecognizedPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    invalidPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    'ui:order': [
      'prompt',
      'property',
      'outputFormat',
      'validations',
      'unrecognizedPrompt',
      'invalidPrompt',
      'maxTurnCount',
      'value',
      'defaultValue',
      '*',
    ],
  },
  [SDKTypes.NumberInput]: {
    prompt: {
      'ui:widget': 'TextareaWidget',
    },
    unrecognizedPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    invalidPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    'ui:order': [
      'prompt',
      'property',
      'outputFormat',
      'validations',
      'unrecognizedPrompt',
      'invalidPrompt',
      'maxTurnCount',
      'value',
      'defaultValue',
      '*',
    ],
  },
  [SDKTypes.ConfirmInput]: {
    prompt: {
      'ui:widget': 'TextareaWidget',
    },
    unrecognizedPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    invalidPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    'ui:order': [
      'prompt',
      'property',
      'style',
      'defaultLocale',
      'validations',
      'unrecognizedPrompt',
      'invalidPrompt',
      'maxTurnCount',
      'value',
      'defaultValue',
      '*',
    ],
    // ConfirmInput defaults to YES/NO. using confirmchoices is complex
    // - must provide yes/no in special format along with alternatives that have to be handled
    // TODO: Implement confirmChoices-specific widget with appropriate business events.
    'ui:hidden': ['confirmChoices'],
  },
  [SDKTypes.ChoiceInput]: {
    prompt: {
      'ui:widget': 'TextareaWidget',
    },
    unrecognizedPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    invalidPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    choices: {
      items: {
        value: {
          'ui:options': {
            label: false,
          },
        },
      },
    },
    ...activityFields,
    'ui:order': [
      'prompt',
      'property',
      'outputFormat',
      'style',
      'defaultLocale',
      'choices',
      'validations',
      'unrecognizedPrompt',
      'invalidPrompt',
      'maxTurnCount',
      'value',
      'defaultValue',
      '*',
    ],
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
  [SDKTypes.AttachmentInput]: {
    prompt: {
      'ui:widget': 'TextareaWidget',
    },
    unrecognizedPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    invalidPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    'ui:order': [
      'prompt',
      'property',
      'outputFormat',
      'validations',
      'unrecognizedPrompt',
      'invalidPrompt',
      'maxTurnCount',
      'value',
      'defaultValue',
      '*',
    ],
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
  [SDKTypes.DateTimeInput]: {
    prompt: {
      'ui:widget': 'TextareaWidget',
    },
    unrecognizedPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    invalidPrompt: {
      'ui:widget': 'TextareaWidget',
    },
    defaultValue: {
      'ui:widget': 'DateTimeWidget',
    },
  },
};
