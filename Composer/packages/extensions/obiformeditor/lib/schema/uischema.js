// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __spreadArrays =
  (this && this.__spreadArrays) ||
  function() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];
    return r;
  };
var _a;
import { SDKTypes, PROMPT_TYPES } from '@bfc/shared';
var globalHidden = ['property', 'id'];
var promptFieldsSchemas = PROMPT_TYPES.reduce(function(schemas, type) {
  schemas[type] = {
    'ui:field': 'PromptField',
  };
  return schemas;
}, {});
var triggerUiSchema = {
  'ui:order': ['condition', '*'],
  'ui:hidden': __spreadArrays(['actions'], globalHidden),
};
export var uiSchema = __assign(
  ((_a = {}),
  (_a[SDKTypes.AdaptiveDialog] = {
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
    'ui:hidden': __spreadArrays(['triggers', 'autoEndDialog', 'generator'], globalHidden),
  }),
  (_a[SDKTypes.BeginDialog] = {
    dialog: {
      'ui:widget': 'DialogSelectWidget',
    },
    options: {
      'ui:field': 'CustomObjectField',
    },
    'ui:order': ['dialog', 'options', 'resultProperty', 'includeActivity', '*'],
  }),
  (_a[SDKTypes.CancelAllDialogs] = {
    eventValue: {
      'ui:field': 'CustomObjectField',
    },
    'ui:order': ['dialog', 'property', '*'],
  }),
  (_a[SDKTypes.ConditionalSelector] = {
    ifFalse: {
      'ui:field': 'SelectorField',
    },
    ifTrue: {
      'ui:field': 'SelectorField',
    },
    'ui:hidden': __spreadArrays(globalHidden),
  }),
  (_a[SDKTypes.EditActions] = {
    actions: {
      'ui:field': 'StepsField',
    },
  }),
  (_a[SDKTypes.Foreach] = {
    'ui:order': ['itemsProperty', 'actions', '*'],
    'ui:hidden': ['actions'],
  }),
  (_a[SDKTypes.ForeachPage] = {
    'ui:order': ['itemsProperty', 'pageSize', 'actions', '*'],
    'ui:hidden': ['actions'],
  }),
  (_a[SDKTypes.HttpRequest] = {
    body: {
      'ui:field': 'JsonField',
    },
    headers: {
      'ui:field': 'CustomObjectField',
    },
    'ui:order': ['method', 'url', 'body', 'property', 'responseTypes', 'headers', '*'],
  }),
  (_a[SDKTypes.IfCondition] = {
    'ui:hidden': __spreadArrays(['actions', 'elseActions'], globalHidden),
  }),
  (_a[SDKTypes.SetProperties] = {
    assignments: {
      'ui:options': {
        hideLabel: true,
        transparentBorder: true,
      },
      'ui:field': 'AssignmentsField',
    },
  }),
  (_a[SDKTypes.OnActivity] = __assign({}, triggerUiSchema)),
  (_a[SDKTypes.OnBeginDialog] = __assign({}, triggerUiSchema)),
  (_a[SDKTypes.OnCancelDialog] = __assign({}, triggerUiSchema)),
  (_a[SDKTypes.OnCondition] = __assign({}, triggerUiSchema)),
  (_a[SDKTypes.OnConversationUpdateActivity] = __assign({}, triggerUiSchema)),
  (_a[SDKTypes.OnCustomEvent] = __assign({}, triggerUiSchema)),
  (_a[SDKTypes.OnDialogEvent] = __assign({}, triggerUiSchema)),
  (_a[SDKTypes.OnEndOfConversationActivity] = __assign({}, triggerUiSchema)),
  (_a[SDKTypes.OnError] = __assign({}, triggerUiSchema)),
  (_a[SDKTypes.OnEventActivity] = __assign({}, triggerUiSchema)),
  (_a[SDKTypes.OnHandoffActivity] = __assign({}, triggerUiSchema)),
  (_a[SDKTypes.OnIntent] = {
    intent: {
      'ui:widget': 'IntentWidget',
    },
    'ui:order': ['intent', 'condition', 'entities', '*'],
    'ui:hidden': __spreadArrays(['actions'], globalHidden),
  }),
  (_a[SDKTypes.OnInvokeActivity] = __assign({}, triggerUiSchema)),
  (_a[SDKTypes.OnMessageActivity] = __assign({}, triggerUiSchema)),
  (_a[SDKTypes.OnMessageDeleteActivity] = __assign({}, triggerUiSchema)),
  (_a[SDKTypes.OnMessageReactionActivity] = __assign({}, triggerUiSchema)),
  (_a[SDKTypes.OnMessageUpdateActivity] = __assign({}, triggerUiSchema)),
  (_a[SDKTypes.OnRepromptDialog] = __assign({}, triggerUiSchema)),
  (_a[SDKTypes.OnTypingActivity] = __assign({}, triggerUiSchema)),
  (_a[SDKTypes.OnUnknownIntent] = __assign({}, triggerUiSchema)),
  (_a[SDKTypes.MostSpecificSelector] = {
    selector: {
      'ui:field': 'SelectorField',
    },
    'ui:hidden': __spreadArrays(globalHidden),
  }),
  (_a[SDKTypes.OAuthInput] = {
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
  }),
  (_a[SDKTypes.QnAMakerDialog] = {
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
  }),
  (_a[SDKTypes.ReplaceDialog] = {
    dialog: {
      'ui:widget': 'DialogSelectWidget',
    },
    options: {
      'ui:field': 'CustomObjectField',
    },
    'ui:hidden': __spreadArrays(globalHidden),
    'ui:order': ['dialog', 'options', 'includeActivity', '*'],
  }),
  (_a[SDKTypes.RepeatDialog] = {
    options: {
      'ui:field': 'CustomObjectField',
    },
    'ui:hidden': __spreadArrays(globalHidden),
    'ui:order': ['options', 'includeActivity', '*'],
  }),
  (_a[SDKTypes.SwitchCondition] = {
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
    'ui:hidden': __spreadArrays(['default'], globalHidden),
  }),
  (_a[SDKTypes.SendActivity] = {
    activity: {
      'ui:field': 'LgEditorField',
    },
    'ui:hidden': __spreadArrays(globalHidden),
  }),
  (_a[SDKTypes.SkillDialog] = {
    activity: {
      'ui:field': 'LgEditorField',
      'ui:title': 'Activity',
    },
    'ui:hidden': __spreadArrays(globalHidden),
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
  }),
  _a),
  promptFieldsSchemas
);
//# sourceMappingURL=uischema.js.map
