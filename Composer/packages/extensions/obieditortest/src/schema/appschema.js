export const dialogGroups = {
  'Input/Prompt Dialogs': [
    'Microsoft.TextPrompt',
    'Microsoft.DateTimePrompt',
    'Microsoft.FloatPrompt',
    'Microsoft.IntegerPrompt',
  ],
  'Dialog Steps': [
    'Microsoft.CallDialog',
    'Microsoft.GotoDialog',
    'Microsoft.EndDialog',
    'Microsoft.CancelDialog',
    'Microsoft.SendActivity',
    'Microsoft.IfProperty',
    'Microsoft.HttpRequest',
  ],
  Rules: [
    'Microsoft.BeginDialogRule',
    'Microsoft.EventRule',
    'Microsoft.IntentRule',
    'Microsoft.WelcomeRule',
    'Microsoft.DefaultRule',
  ],
  Recognizers: ['Microsoft.LuisRecognizer', 'Microsoft.RegexRecognizer'],
  Other: ['Microsoft.AdaptiveDialog'],
};

export const mergedSchema = {
  $schema:
    'https://raw.githubusercontent.com/Microsoft/botbuilder-tools/SchemaGen/packages/DialogSchema/src/dialogSchema.schema',
  $id: 'app.schema',
  type: 'object',
  title: 'Component types',
  description: 'These are all of the types that can be created by the loader.',
  oneOf: [
    {
      title: 'Microsoft.AdaptiveDialog',
      description: 'Configures a data driven dialog via a collection of steps/dialogs.',
      $ref: '#/definitions/Microsoft.AdaptiveDialog',
    },
    {
      title: 'Microsoft.BeginDialogRule',
      description: 'Defines a sequence of steps to do when the BeginDialog event fires',
      $ref: '#/definitions/Microsoft.BeginDialogRule',
    },
    {
      title: 'Microsoft.CallDialog',
      description: 'Step which calls another dialog.',
      $ref: '#/definitions/Microsoft.CallDialog',
    },
    {
      title: 'Microsoft.CancelDialog',
      description: 'Command to cancel the current dialog, trigging a cancelation event',
      $ref: '#/definitions/Microsoft.CancelDialog',
    },
    {
      title: 'Microsoft.ChangeList',
      description: 'This is a step which allows you to modify a collection in memory',
      $ref: '#/definitions/Microsoft.ChangeList',
    },
    {
      title: 'Microsoft.ClearProperty',
      description: 'This is a step which allows you to remove a property from',
      $ref: '#/definitions/Microsoft.ClearProperty',
    },
    {
      title: 'Microsoft.DateTimePrompt',
      description: 'This represents a dialog which gathers a DateTime in a specified range',
      $ref: '#/definitions/Microsoft.DateTimePrompt',
    },
    {
      title: 'Microsoft.DefaultRule',
      description: 'Defines a sequence of steps to take if there is no other trigger or plan operating',
      $ref: '#/definitions/Microsoft.DefaultRule',
    },
    {
      title: 'Microsoft.EndDialog',
      description: 'Command which ends the current dialog, returning the resultProperty as the result of the dialog.',
      $ref: '#/definitions/Microsoft.EndDialog',
    },
    {
      title: 'Microsoft.EventRule',
      description: 'Defines a rule for an event which is triggered by some sourcy',
      $ref: '#/definitions/Microsoft.EventRule',
    },
    {
      title: 'Microsoft.FloatPrompt',
      description: 'This represents a dialog which gathers a number in a specified range',
      $ref: '#/definitions/Microsoft.FloatPrompt',
    },
    {
      title: 'Microsoft.GotoDialog',
      description: 'This is a step which replaces the current dialog with the target dialog',
      $ref: '#/definitions/Microsoft.GotoDialog',
    },
    {
      title: 'Microsoft.HttpRequest',
      description: 'This is a step which replaces the current dialog with the target dialog',
      $ref: '#/definitions/Microsoft.HttpRequest',
    },
    {
      title: 'Microsoft.IfProperty',
      description: 'Step which conditionally decides which step to execute next.',
      $ref: '#/definitions/Microsoft.IfProperty',
    },
    {
      title: 'Microsoft.IfPropertyRule',
      description: '',
      $ref: '#/definitions/Microsoft.IfPropertyRule',
    },
    {
      title: 'Microsoft.IntegerPrompt',
      description: 'This represents a dialog which gathers a number in a specified range',
      $ref: '#/definitions/Microsoft.IntegerPrompt',
    },
    {
      title: 'Microsoft.IntentRule',
      description: 'This defines the steps to take when an Intent is recognized (and optionally entities)',
      $ref: '#/definitions/Microsoft.IntentRule',
    },
    {
      title: 'Microsoft.LuisRecognizer',
      description: 'LUIS recognizer.',
      $ref: '#/definitions/Microsoft.LuisRecognizer',
    },
    {
      title: 'Microsoft.QnaMakerRecognizer',
      description: 'This represents a configuration of the QNAMaker as a recognizer',
      $ref: '#/definitions/Microsoft.QnaMakerRecognizer',
    },
    {
      title: 'Microsoft.RegexRecognizer',
      description: 'Recognizer which uses regex expressions to generate intents and entities.',
      $ref: '#/definitions/Microsoft.RegexRecognizer',
    },
    {
      title: 'Microsoft.ReplacePlanRule',
      description: 'Defines a sequence of steps to take when a plan has been replaced with a new plan',
      $ref: '#/definitions/Microsoft.ReplacePlanRule',
    },
    {
      title: 'Microsoft.Rule',
      description: 'Defines a rule for an event which is triggered by some sourcy',
      $ref: '#/definitions/Microsoft.Rule',
    },
    {
      title: 'Microsoft.SaveEntity',
      description: 'This is a step which allows you to save a memory property as an entity',
      $ref: '#/definitions/Microsoft.SaveEntity',
    },
    {
      title: 'Microsoft.SendActivity',
      description: 'This is a step which sends an activity to the user',
      $ref: '#/definitions/Microsoft.SendActivity',
    },
    {
      title: 'Microsoft.SendList',
      description: 'TEMPORARY, THIS SHOULD BE REPLACED WITH LG TEMPLATE',
      $ref: '#/definitions/Microsoft.SendList',
    },
    {
      title: 'Microsoft.TextPrompt',
      description: 'This represents a dialog which gathers a text from the user',
      $ref: '#/definitions/Microsoft.TextPrompt',
    },
    {
      title: 'Microsoft.WaitForInput',
      description: 'Dialog command to wait for input from the user.',
      $ref: '#/definitions/Microsoft.WaitForInput',
    },
    {
      title: 'Microsoft.WelcomeRule',
      description: 'Defines a sequence of steps to take if the user is a new user',
      $ref: '#/definitions/Microsoft.WelcomeRule',
    },
  ],
  definitions: {
    'Microsoft.AdaptiveDialog': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Adaptive Dialog',
      description: 'Configures a data driven dialog via a collection of steps/dialogs.',
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.AdaptiveDialog',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        rules: {
          type: 'array',
          description: 'Array of rules to use to evaluate conversation',
          items: {
            $type: 'Microsoft.IRule',
            $ref: '#/definitions/Microsoft.IRule',
          },
        },
        recognizer: {
          $type: 'Microsoft.IRecognizer',
          $ref: '#/definitions/Microsoft.IRecognizer',
        },
      },
      required: ['$type'],
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      anyOf: [
        {
          title: 'Reference',
          required: ['$copy'],
        },
        {
          title: 'Type',
          required: ['rules'],
        },
      ],
    },
    'Microsoft.BeginDialogRule': {
      title: 'BeginDialogRule Rule',
      description: 'Defines a sequence of steps to do when the BeginDialog event fires',
      required: ['$type'],
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.BeginDialogRule',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        events: {
          type: 'array',
          description: 'Events to trigger this rule for',
          items: {
            type: 'string',
          },
        },
        expression: {
          type: 'string',
          title: 'Constraint',
          description: 'Optional constraint to which must be met for this rule to fire',
          examples: ['user.vip == true'],
        },
        steps: {
          type: 'array',
          description: 'Sequence of steps or dialogs to execute',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        changeType: {
          type: 'string',
          enum: ['NewPlan', 'DoSteps', 'DoStepsBeforeTags', 'DoStepsLater', 'EndPlan', 'ReplacePlan'],
        },
      },
      $role: 'unionType(Microsoft.IRule)',
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      anyOf: [
        {
          title: 'Reference',
          required: ['$copy'],
        },
        {
          title: 'Type',
          required: ['steps'],
        },
      ],
    },
    'Microsoft.CallDialog': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Call Dialog',
      description: 'Step which calls another dialog.',
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.CallDialog',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        dialog: {
          $type: 'Microsoft.IDialog',
          title: 'Dialog',
          description: 'This is the dialog to call.',
          $ref: '#/definitions/Microsoft.IDialog',
        },
        options: {
          type: 'object',
          title: 'Options',
          description: 'Options to pass to the dialog.',
          additionalProperties: true,
        },
        property: {
          type: 'string',
          title: 'Property',
          description: 'The property to bind to the dialog and store the result in',
          examples: ['user.name'],
        },
      },
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      required: ['$type'],
    },
    'Microsoft.CancelDialog': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Cancel Dialog',
      description: 'Command to cancel the current dialog, trigging a cancelation event',
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.CancelDialog',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
      },
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      required: ['$type'],
    },
    'Microsoft.ChangeList': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Change List Step',
      description: 'This is a step which allows you to modify a collection in memory',
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.ChangeList',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        changeType: {
          type: 'string',
          title: 'Change Type',
          description: 'The list operation to perform',
          enum: ['Push', 'Pop', 'Take', 'Remove', 'Clear'],
        },
        listProperty: {
          type: 'string',
          title: 'List Property',
          description: 'Memory expression of the list to manipulate.',
        },
        itemProperty: {
          type: 'string',
          title: 'List Property',
          description: 'Memory expression for the item',
        },
      },
      required: ['$type'],
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      anyOf: [
        {
          title: 'Reference',
          required: ['$copy'],
        },
        {
          title: 'Type',
          required: ['changeType', 'listProperty'],
        },
      ],
    },
    'Microsoft.ClearProperty': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'ClearProperty Step',
      description: 'This is a step which allows you to remove a property from',
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.ClearProperty',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        property: {
          type: 'string',
          title: 'Property',
          description: 'The Memory property path to clear',
        },
      },
      required: ['$type'],
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      anyOf: [
        {
          title: 'Reference',
          required: ['$copy'],
        },
        {
          title: 'Type',
          required: ['property'],
        },
      ],
    },
    'Microsoft.DateTimePrompt': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'DateTime prompt',
      description: 'This represents a dialog which gathers a DateTime in a specified range',
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.DateTimePrompt',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        property: {
          type: 'string',
          description: 'This is the property to set.',
          examples: ['value.birthday'],
        },
        minValue: {
          type: 'integer',
          title: 'Mininum value',
          description:
            'The minimum value that is acceptable.  If the value is less then this then the TooSmallReponse and RetryPrompt will be sent.',
          examples: ['1900-01-01'],
        },
        maxValue: {
          type: 'integer',
          title: 'Maximum value',
          description:
            'The maximum value that is acceptable.  If the value is greater then this then the TooLargeResponse and RetryPrompt will be sent.',
          examples: ['2100-01-01'],
        },
        initialPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Initial Prompt',
          description: 'The message to send to start.',
          examples: ['What is your birth date?'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        retryPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Retry Prompt',
          description: 'The message to send to prompt again.',
          examples: ["Let's try again. What is your birth date?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        noMatchResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'No match',
          description: 'The message to send to when no date was recognized.',
          examples: ['No date was recognized'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        tooSmallResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Too small',
          description: 'The message to send to when the recognized number was less then the MinValue. ',
          examples: ['Hmmm...I think your birthday means you must be dead.'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        tooLargeResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Too large',
          description: 'The message to send to when the recognized number was greater then the MinValue.',
          examples: ["You can't be born in the future!"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
      },
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      required: ['$type'],
    },
    'Microsoft.DefaultRule': {
      title: 'Default Rule',
      description: 'Defines a sequence of steps to take if there is no other trigger or plan operating',
      required: ['$type'],
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.DefaultRule',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        events: {
          type: 'array',
          description: 'Events to trigger this rule for',
          items: {
            type: 'string',
          },
        },
        expression: {
          type: 'string',
          title: 'Constraint',
          description: 'Optional constraint to which must be met for this rule to fire',
          examples: ['user.vip == true'],
        },
        steps: {
          type: 'array',
          description: 'Sequence of steps or dialogs to execute',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        changeType: {
          type: 'string',
          enum: ['NewPlan', 'DoSteps', 'DoStepsBeforeTags', 'DoStepsLater', 'EndPlan', 'ReplacePlan'],
        },
      },
      $role: 'unionType(Microsoft.IRule)',
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      anyOf: [
        {
          title: 'Reference',
          required: ['$copy'],
        },
        {
          title: 'Type',
          required: ['steps'],
        },
      ],
    },
    'Microsoft.EndDialog': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'End Dialog',
      description: 'Command which ends the current dialog, returning the resultProperty as the result of the dialog.',
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.EndDialog',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        property: {
          title: 'Property',
          description: 'Specifies a path to memory should be returned as the result to the calling dialog.',
          examples: ['dialog.name'],
        },
      },
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      required: ['$type'],
    },
    'Microsoft.EventRule': {
      title: 'Event Rule',
      description: 'Defines a rule for an event which is triggered by some sourcy',
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.EventRule',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        events: {
          type: 'array',
          description: 'Events to trigger this rule for',
          items: {
            type: 'string',
          },
        },
        expression: {
          type: 'string',
          title: 'Constraint',
          description: 'Optional constraint to which must be met for this rule to fire',
          examples: ['user.vip == true'],
        },
        steps: {
          type: 'array',
          description: 'Sequence of steps or dialogs to execute',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        changeType: {
          type: 'string',
          enum: ['NewPlan', 'DoSteps', 'DoStepsBeforeTags', 'DoStepsLater', 'EndPlan', 'ReplacePlan'],
        },
      },
      required: ['$type'],
      $role: 'unionType(Microsoft.IRule)',
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      anyOf: [
        {
          title: 'Reference',
          required: ['$copy'],
        },
        {
          title: 'Type',
          required: ['events', 'steps'],
        },
      ],
    },
    'Microsoft.FloatPrompt': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Float  prompt',
      description: 'This represents a dialog which gathers a number in a specified range',
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.FloatPrompt',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        property: {
          type: 'string',
          description: 'This is the property to set.',
          examples: ['value.age'],
        },
        minValue: {
          type: 'integer',
          title: 'Mininum value',
          description:
            'The minimum value that is acceptable.  If the value is less then this then the TooSmallReponse and RetryPrompt will be sent.',
          examples: ['0'],
        },
        maxValue: {
          type: 'integer',
          title: 'Maximum value',
          description:
            'The maximum value that is acceptable.  If the value is greater then this then the TooLargeResponse and RetryPrompt will be sent.',
          examples: ['120'],
        },
        initialPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Initial Prompt',
          description: 'The message to send to start.',
          examples: ['What is your age?'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        retryPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Retry Prompt',
          description: 'The message to send to prompt again.',
          examples: ["Let's try again. What is your age?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        noMatchResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'No match',
          description: 'The message to send to when no number was recognized.',
          examples: ['No number was recognized'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        tooSmallResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Too small',
          description: 'The message to send to when the recognized number was less then the MinValue. ',
          examples: ['Nobody is younger than 0.'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        tooLargeResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Too large',
          description: 'The message to send to when the recognized number was greater then the MinValue.',
          examples: ['Nobody is that old!'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
      },
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      required: ['$type'],
    },
    'Microsoft.GotoDialog': {
      $role: 'unionType(Microsoft.IDialog)',
      type: 'object',
      title: 'Goto Dialog',
      description: 'This is a step which replaces the current dialog with the target dialog',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.GotoDialog',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        dialog: {
          $type: 'Microsoft.IDialog',
          title: 'Dialog',
          description: 'This is the dialog to switch to.',
          $ref: '#/definitions/Microsoft.IDialog',
        },
        options: {
          type: 'object',
          title: 'Options',
          description: 'Options to pass to the dialog.',
          additionalProperties: true,
        },
        property: {
          title: 'Property',
          description: 'The property to bind to the dialog and store the result in',
          examples: ['user.name'],
        },
      },
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      required: ['$type'],
    },
    'Microsoft.HttpRequest': {
      $role: 'unionType(Microsoft.IDialog)',
      type: 'object',
      title: 'Goto Dialog',
      description: 'This is a step which replaces the current dialog with the target dialog',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.HttpRequest',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        method: {
          type: 'string',
          title: 'Method',
          description: 'The HTTP method to use',
          enum: ['GET', 'POST'],
          examples: ['GET', 'POST'],
        },
        url: {
          type: 'string',
          title: 'Url',
          description: 'The url to call (supports data binding)',
          examples: ['https://contoso.com'],
        },
        body: {
          type: 'object',
          title: 'Body',
          description: 'The body to send in the HTTP call  (supports data binding)',
          additionalProperties: true,
        },
        property: {
          type: 'string',
          title: 'Property',
          description: 'The property to store the result of the HTTP call in (as object or string)',
          examples: ['dialog.contosodata'],
        },
        header: {
          type: 'object',
          additionProperties: true,
          title: 'Http headers',
          description: 'Http headers to include with the HTTP request (supports data binding)',
        },
      },
      required: ['$type'],
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      anyOf: [
        {
          title: 'Reference',
          required: ['$copy'],
        },
        {
          title: 'Type',
          required: ['url', 'entity'],
        },
      ],
    },
    'Microsoft.IActivityTemplate': {
      title: 'Microsoft ActivityTemplate',
      description: 'Union of components which implement the IActivityTemplate interface',
      $role: 'unionType',
      oneOf: [
        {
          type: 'string',
          title: 'string',
        },
      ],
    },
    'Microsoft.IDialog': {
      title: 'Microsoft IDialog',
      description: 'Union of components which implement the IDialog interface',
      $role: 'unionType',
      type: 'object',
      oneOf: [
        {
          title: 'Microsoft.AdaptiveDialog',
          description: 'Configures a data driven dialog via a collection of steps/dialogs.',
          $ref: '#/definitions/Microsoft.AdaptiveDialog',
        },
        {
          title: 'Microsoft.CallDialog',
          description: 'Step which calls another dialog.',
          $ref: '#/definitions/Microsoft.CallDialog',
        },
        {
          title: 'Microsoft.CancelDialog',
          description: 'Command to cancel the current dialog, trigging a cancelation event',
          $ref: '#/definitions/Microsoft.CancelDialog',
        },
        {
          title: 'Microsoft.ChangeList',
          description: 'This is a step which allows you to modify a collection in memory',
          $ref: '#/definitions/Microsoft.ChangeList',
        },
        {
          title: 'Microsoft.ClearProperty',
          description: 'This is a step which allows you to remove a property from',
          $ref: '#/definitions/Microsoft.ClearProperty',
        },
        {
          title: 'Microsoft.DateTimePrompt',
          description: 'This represents a dialog which gathers a DateTime in a specified range',
          $ref: '#/definitions/Microsoft.DateTimePrompt',
        },
        {
          title: 'Microsoft.EndDialog',
          description:
            'Command which ends the current dialog, returning the resultProperty as the result of the dialog.',
          $ref: '#/definitions/Microsoft.EndDialog',
        },
        {
          title: 'Microsoft.FloatPrompt',
          description: 'This represents a dialog which gathers a number in a specified range',
          $ref: '#/definitions/Microsoft.FloatPrompt',
        },
        {
          title: 'Microsoft.GotoDialog',
          description: 'This is a step which replaces the current dialog with the target dialog',
          $ref: '#/definitions/Microsoft.GotoDialog',
        },
        {
          title: 'Microsoft.HttpRequest',
          description: 'This is a step which replaces the current dialog with the target dialog',
          $ref: '#/definitions/Microsoft.HttpRequest',
        },
        {
          title: 'Microsoft.IfProperty',
          description: 'Step which conditionally decides which step to execute next.',
          $ref: '#/definitions/Microsoft.IfProperty',
        },
        {
          title: 'Microsoft.IntegerPrompt',
          description: 'This represents a dialog which gathers a number in a specified range',
          $ref: '#/definitions/Microsoft.IntegerPrompt',
        },
        {
          title: 'Microsoft.SaveEntity',
          description: 'This is a step which allows you to save a memory property as an entity',
          $ref: '#/definitions/Microsoft.SaveEntity',
        },
        {
          title: 'Microsoft.SendActivity',
          description: 'This is a step which sends an activity to the user',
          $ref: '#/definitions/Microsoft.SendActivity',
        },
        {
          title: 'Microsoft.SendList',
          description: 'TEMPORARY, THIS SHOULD BE REPLACED WITH LG TEMPLATE',
          $ref: '#/definitions/Microsoft.SendList',
        },
        {
          title: 'Microsoft.TextPrompt',
          description: 'This represents a dialog which gathers a text from the user',
          $ref: '#/definitions/Microsoft.TextPrompt',
        },
        {
          title: 'Microsoft.WaitForInput',
          description: 'Dialog command to wait for input from the user.',
          $ref: '#/definitions/Microsoft.WaitForInput',
        },
        {
          type: 'string',
          title: 'string',
        },
      ],
    },
    'Microsoft.IExpression': {
      title: 'Microsoft IExpression',
      description: 'Union of components which implement the IExpression interface',
      $role: 'unionType',
      oneOf: [
        {
          type: 'string',
          title: 'string',
        },
      ],
    },
    'Microsoft.IRecognizer': {
      title: 'Microsoft IRecognizer',
      description: 'Union of components which implement the IRecognizer interface',
      $role: 'unionType',
      oneOf: [
        {
          title: 'Microsoft.LuisRecognizer',
          description: 'LUIS recognizer.',
          $ref: '#/definitions/Microsoft.LuisRecognizer',
        },
        {
          title: 'Microsoft.QnaMakerRecognizer',
          description: 'This represents a configuration of the QNAMaker as a recognizer',
          $ref: '#/definitions/Microsoft.QnaMakerRecognizer',
        },
        {
          title: 'Microsoft.RegexRecognizer',
          description: 'Recognizer which uses regex expressions to generate intents and entities.',
          $ref: '#/definitions/Microsoft.RegexRecognizer',
        },
      ],
    },
    'Microsoft.IRule': {
      title: 'Microsoft IRule',
      description: 'Union of components which implement the IRule interface',
      $role: 'unionType',
      type: 'object',
      oneOf: [
        {
          title: 'Microsoft.BeginDialogRule',
          description: 'Defines a sequence of steps to do when the BeginDialog event fires',
          $ref: '#/definitions/Microsoft.BeginDialogRule',
        },
        {
          title: 'Microsoft.DefaultRule',
          description: 'Defines a sequence of steps to take if there is no other trigger or plan operating',
          $ref: '#/definitions/Microsoft.DefaultRule',
        },
        {
          title: 'Microsoft.EventRule',
          description: 'Defines a rule for an event which is triggered by some sourcy',
          $ref: '#/definitions/Microsoft.EventRule',
        },
        {
          title: 'Microsoft.IfPropertyRule',
          description: '',
          $ref: '#/definitions/Microsoft.IfPropertyRule',
        },
        {
          title: 'Microsoft.IntentRule',
          description: 'This defines the steps to take when an Intent is recognized (and optionally entities)',
          $ref: '#/definitions/Microsoft.IntentRule',
        },
        {
          title: 'Microsoft.ReplacePlanRule',
          description: 'Defines a sequence of steps to take when a plan has been replaced with a new plan',
          $ref: '#/definitions/Microsoft.ReplacePlanRule',
        },
        {
          title: 'Microsoft.Rule',
          description: 'Defines a rule for an event which is triggered by some sourcy',
          $ref: '#/definitions/Microsoft.Rule',
        },
        {
          title: 'Microsoft.WelcomeRule',
          description: 'Defines a sequence of steps to take if the user is a new user',
          $ref: '#/definitions/Microsoft.WelcomeRule',
        },
      ],
    },
    'Microsoft.ITextTemplate': {
      title: 'Microsoft TextTemplate',
      description: 'Union of components which implement the ITextTemplate interface',
      $role: 'unionType',
      oneOf: [
        {
          type: 'string',
          title: 'string',
        },
      ],
    },
    'Microsoft.IfProperty': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'If Step',
      description: 'Step which conditionally decides which step to execute next.',
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.IfProperty',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        ifTrue: {
          oneOf: [
            {
              $type: 'Microsoft.IDialog',
              $ref: '#/definitions/Microsoft.IDialog',
            },
            {
              type: 'array',
              items: {
                $type: 'Microsoft.IDialog',
                $ref: '#/definitions/Microsoft.IDialog',
              },
              title: 'array',
            },
          ],
          title: 'If True',
          description: 'Step to execute if expression is true.',
        },
        ifFalse: {
          oneOf: [
            {
              $type: 'Microsoft.IDialog',
              $ref: '#/definitions/Microsoft.IDialog',
            },
            {
              type: 'array',
              items: {
                $type: 'Microsoft.IDialog',
                $ref: '#/definitions/Microsoft.IDialog',
              },
              title: 'array',
            },
          ],
          title: 'If False',
          description: 'Step to execute if expression is false.',
        },
        expression: {
          $type: 'Microsoft.IExpression',
          title: 'Condition',
          description: 'Expression to evaluate.',
          examples: ['user.age > 3'],
          $ref: '#/definitions/Microsoft.IExpression',
        },
      },
      required: ['$type'],
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      anyOf: [
        {
          title: 'Reference',
          required: ['$copy'],
        },
        {
          title: 'Type',
          required: ['expression', 'ifTrue'],
        },
      ],
    },
    'Microsoft.IfPropertyRule': {
      $role: 'unionType(Microsoft.IRule)',
      title: '',
      description: '',
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.IfPropertyRule',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        conditionals: {
          type: 'array',
          items: {
            type: 'object',
            expression: {
              $type: 'Microsoft.IExpression',
              $ref: '#/definitions/Microsoft.IExpression',
            },
            rules: {
              type: 'array',
              items: {
                $type: 'Microsoft.IRule',
                $ref: '#/definitions/Microsoft.IRule',
              },
            },
          },
        },
        else: {
          type: 'array',
          items: {
            $type: 'Microsoft.IRule',
            $ref: '#/definitions/Microsoft.IRule',
          },
        },
      },
      required: ['$type'],
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      anyOf: [
        {
          title: 'Reference',
          required: ['$copy'],
        },
        {
          title: 'Type',
          required: ['conditionals'],
        },
      ],
    },
    'Microsoft.IntegerPrompt': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Integer prompt',
      description: 'This represents a dialog which gathers a number in a specified range',
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.IntegerPrompt',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        property: {
          type: 'string',
          description: 'This is the property to set.',
          examples: ['value.age'],
        },
        minValue: {
          type: 'integer',
          title: 'Mininum value',
          description:
            'The minimum value that is acceptable.  If the value is less then this then the TooSmallReponse and RetryPrompt will be sent.',
          examples: ['0'],
        },
        maxValue: {
          type: 'integer',
          title: 'Maximum value',
          description:
            'The maximum value that is acceptable.  If the value is greater then this then the TooLargeResponse and RetryPrompt will be sent.',
          examples: ['120'],
        },
        initialPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Initial Prompt',
          description: 'The message to send to start.',
          examples: ['What is your age?'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        retryPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Retry Prompt',
          description: 'The message to send to prompt again.',
          examples: ["Let's try again. What is your age?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        noMatchResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'No match',
          description: 'The message to send to when no number was recognized.',
          examples: ['No number was recognized'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        tooSmallResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Too small',
          description: 'The message to send to when the recognized number was less then the MinValue. ',
          examples: ['Nobody is younger than 0.'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        tooLargeResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Too large',
          description: 'The message to send to when the recognized number was greater then the MinValue.',
          examples: ['Nobody is that old!'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
      },
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      required: ['$type'],
    },
    'Microsoft.IntentRule': {
      $role: 'unionType(Microsoft.IRule)',
      title: 'Intent Rule',
      description: 'This defines the steps to take when an Intent is recognized (and optionally entities)',
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.IntentRule',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        intent: {
          type: 'string',
          title: 'Intent',
          description: 'Intent name to trigger on',
        },
        entities: {
          type: 'array',
          title: 'Entities',
          description: 'The entities required to trigger this rule',
        },
        events: {
          type: 'array',
          description: 'Events to trigger this rule for',
          items: {
            type: 'string',
          },
        },
        expression: {
          type: 'string',
          title: 'Constraint',
          description: 'Optional constraint to which must be met for this rule to fire',
          examples: ['user.vip == true'],
        },
        steps: {
          type: 'array',
          description: 'Sequence of steps or dialogs to execute',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        changeType: {
          type: 'string',
          enum: ['NewPlan', 'DoSteps', 'DoStepsBeforeTags', 'DoStepsLater', 'EndPlan', 'ReplacePlan'],
        },
      },
      required: ['$type'],
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      anyOf: [
        {
          title: 'Reference',
          required: ['$copy'],
        },
        {
          title: 'Type',
          required: ['intent', 'steps'],
        },
      ],
    },
    'Microsoft.LuisRecognizer': {
      $role: 'unionType(Microsoft.IRecognizer)',
      title: 'LUIS Recognizer',
      description: 'LUIS recognizer.',
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.LuisRecognizer',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        applicationId: {
          type: 'string',
        },
        endpoint: {
          type: 'string',
        },
        endpointKey: {
          type: 'string',
        },
        priority: {
          type: 'string',
        },
      },
      required: ['$type'],
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      anyOf: [
        {
          title: 'Reference',
          required: ['$copy'],
        },
        {
          title: 'Type',
          required: ['applicationId', 'endpoint', 'endpointKey'],
        },
      ],
    },
    'Microsoft.QnaMakerRecognizer': {
      $role: 'unionType(Microsoft.IRecognizer)',
      title: 'QnAMaker.ai Recognizer',
      description: 'This represents a configuration of the QNAMaker as a recognizer',
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.QnaMakerRecognizer',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        applicationId: {
          type: 'string',
          description: 'This is the QnAMaker appId to use',
          examples: ['123123123'],
        },
        endpoint: {
          type: 'string',
          description: 'This is the QnAMaker endpoint to use',
          examples: ['http://westus.qnamaker.ai'],
        },
      },
      required: ['$type'],
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      anyOf: [
        {
          title: 'Reference',
          required: ['$copy'],
        },
        {
          title: 'Type',
          required: ['applicationId', 'endpoint'],
        },
      ],
    },
    'Microsoft.RegexRecognizer': {
      $role: 'unionType(Microsoft.IRecognizer)',
      title: 'Regex Recognizer',
      description: 'Recognizer which uses regex expressions to generate intents and entities.',
      type: 'object',
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.RegexRecognizer',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        intents: {
          type: 'object',
          title: 'RegEx patterns to intents',
          description: 'Pattern->Intents mappings',
          additionalProperties: {
            type: 'string',
          },
        },
      },
      required: ['$type'],
      additionalProperties: false,
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      anyOf: [
        {
          title: 'Reference',
          required: ['$copy'],
        },
        {
          title: 'Type',
          required: ['intents'],
        },
      ],
    },
    'Microsoft.ReplacePlanRule': {
      $role: 'unionType(Microsoft.IRule)',
      title: 'ReplacePlan Rule',
      description: 'Defines a sequence of steps to take when a plan has been replaced with a new plan',
      type: 'object',
      additionalProperties: false,
      required: ['$type'],
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.ReplacePlanRule',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        events: {
          type: 'array',
          description: 'Events to trigger this rule for',
          items: {
            type: 'string',
          },
        },
        expression: {
          type: 'string',
          title: 'Constraint',
          description: 'Optional constraint to which must be met for this rule to fire',
          examples: ['user.vip == true'],
        },
        steps: {
          type: 'array',
          description: 'Sequence of steps or dialogs to execute',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        changeType: {
          type: 'string',
          enum: ['NewPlan', 'DoSteps', 'DoStepsBeforeTags', 'DoStepsLater', 'EndPlan', 'ReplacePlan'],
        },
      },
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      anyOf: [
        {
          title: 'Reference',
          required: ['$copy'],
        },
        {
          title: 'Type',
          required: ['steps'],
        },
      ],
    },
    'Microsoft.Rule': {
      $role: 'unionType(Microsoft.IRule)',
      title: 'Event Rule',
      description: 'Defines a rule for an event which is triggered by some sourcy',
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.Rule',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        expression: {
          type: 'string',
          title: 'Constraint',
          description: 'Optional constraint to which must be met for this rule to fire',
          examples: ['user.vip == true'],
        },
        steps: {
          type: 'array',
          description: 'Sequence of steps or dialogs to execute',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        changeType: {
          type: 'string',
          enum: ['NewPlan', 'DoSteps', 'DoStepsBeforeTags', 'DoStepsLater', 'EndPlan', 'ReplacePlan'],
        },
      },
      required: ['$type'],
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      anyOf: [
        {
          title: 'Reference',
          required: ['$copy'],
        },
        {
          title: 'Type',
          required: ['events', 'steps'],
        },
      ],
    },
    'Microsoft.SaveEntity': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'SaveEntity Step',
      description: 'This is a step which allows you to save a memory property as an entity',
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.SaveEntity',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        entity: {
          type: 'string',
          title: 'Entity',
          description: 'name of the entity to save',
        },
        property: {
          type: 'string',
          title: 'Property',
          description: 'Memory expression of the property to save as an entity.',
        },
      },
      required: ['$type'],
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      anyOf: [
        {
          title: 'Reference',
          required: ['$copy'],
        },
        {
          title: 'Type',
          required: ['property', 'entity'],
        },
      ],
    },
    'Microsoft.SendActivity': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Send Activity Step',
      description: 'This is a step which sends an activity to the user',
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.SendActivity',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        activity: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Activity',
          description: 'Activity to send to the user',
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
      },
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      required: ['$type'],
    },
    'Microsoft.SendList': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'SendList Step',
      description: 'TEMPORARY, THIS SHOULD BE REPLACED WITH LG TEMPLATE',
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.SendList',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        listProperty: {
          type: 'string',
          title: 'List Property',
          description: 'Memory expression of the list to manipulate.',
        },
        messageTemplate: {
          type: 'string',
          title: 'List Property',
          description: 'Memory expression for the item',
        },
        itemTemplate: {
          type: 'string',
          title: 'List Property',
          description: 'Memory expression for the item',
        },
      },
      required: ['$type'],
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      anyOf: [
        {
          title: 'Reference',
          required: ['$copy'],
        },
        {
          title: 'Type',
          required: ['listProperty', 'messageTemplate', 'itemTemplate'],
        },
      ],
    },
    'Microsoft.TextPrompt': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Text prompt',
      description: 'This represents a dialog which gathers a text from the user',
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.TextPrompt',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        property: {
          type: 'string',
          description: 'This is the property to set the result.',
          examples: ['value.name'],
        },
        pattern: {
          type: 'string',
          title: 'Pattern',
          description: 'A regular expression pattern which must match',
          examples: ['\\w{3,30}'],
        },
        initialPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Initial Prompt',
          description: 'The message to send to start.',
          examples: ['What is your name?'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        retryPrompt: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Retry Prompt',
          description: 'The message to send to prompt again.',
          examples: ["Let's try again. What is your name?"],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
        noMatchResponse: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'No match',
          description: "The message to send to when the input didn't match.",
          examples: ["That doesn't match the pattern requirements.", 'A valid phone number looks like xxx-xxx-xxxx.'],
          $ref: '#/definitions/Microsoft.IActivityTemplate',
        },
      },
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      required: ['$type'],
    },
    'Microsoft.WaitForInput': {
      $role: 'unionType(Microsoft.IDialog)',
      title: 'Wait for input from the user',
      description: 'Dialog command to wait for input from the user.',
      type: 'object',
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.WaitForInput',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        property: {
          type: 'string',
          description: 'This is the property to set the result.',
          examples: ['value.name'],
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
      },
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      required: ['$type'],
    },
    'Microsoft.WelcomeRule': {
      $role: 'unionType(Microsoft.IRule)',
      title: 'Welcome Rule',
      description: 'Defines a sequence of steps to take if the user is a new user',
      type: 'object',
      required: ['$type'],
      additionalProperties: false,
      properties: {
        $type: {
          title: '$type',
          description:
            'Defines the valid properties for the component you are configuring (from a dialog .schema file)',
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9.]*$',
          const: 'Microsoft.WelcomeRule',
        },
        $copy: {
          title: '$copy',
          description: 'Copy the definition by id from a .dialog file.',
          type: 'string',
          pattern: '^(([a-zA-Z][a-zA-Z0-9.]*)?(#[a-zA-Z][a-zA-Z0-9.]*)?)$',
        },
        $id: {
          title: '$id',
          description: 'Inline id for reuse of an inline definition',
          type: 'string',
          pattern: '^([a-zA-Z][a-zA-Z0-9.]*)$',
        },
        events: {
          type: 'array',
          description: 'Events to trigger this rule for',
          items: {
            type: 'string',
          },
        },
        expression: {
          type: 'string',
          title: 'Constraint',
          description: 'Optional constraint to which must be met for this rule to fire',
          examples: ['user.vip == true'],
        },
        steps: {
          type: 'array',
          description: 'Sequence of steps or dialogs to execute',
          items: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
        changeType: {
          type: 'string',
          enum: ['NewPlan', 'DoSteps', 'DoStepsBeforeTags', 'DoStepsLater', 'EndPlan', 'ReplacePlan'],
        },
      },
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      anyOf: [
        {
          title: 'Reference',
          required: ['$copy'],
        },
        {
          title: 'Type',
          required: ['steps'],
        },
      ],
    },
  },
};
