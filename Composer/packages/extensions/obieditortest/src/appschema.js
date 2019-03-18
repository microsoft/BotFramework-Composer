export const masterSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  title: 'Component types',
  description: 'These are all of the types that can be created by the loader.',
  oneOf: [
    {
      title: 'Microsoft.CallDialog',
      description: 'Step which calls another dialog.',
      $ref: '#/definitions/Microsoft.CallDialog',
    },
    {
      title: 'Microsoft.CancelDialog',
      description: 'This is a step which cancels the current dialog, returning no result',
      $ref: '#/definitions/Microsoft.CancelDialog',
    },
    {
      title: 'Microsoft.ClearPropertyStep',
      description: 'This is a step which removes a property from memory',
      $ref: '#/definitions/Microsoft.ClearPropertyStep',
    },
    {
      title: 'Microsoft.DateTimePrompt',
      description: 'This represents a dialog which gathers a DateTime in a specified range',
      $ref: '#/definitions/Microsoft.DateTimePrompt',
    },
    {
      title: 'Microsoft.EndDialog',
      description: 'This is a step which ends the current dialog, returning the result',
      $ref: '#/definitions/Microsoft.EndDialog',
    },
    {
      title: 'Microsoft.EndOfTurnStep',
      description: 'This is a step which ends the current turn',
      $ref: '#/definitions/Microsoft.EndOfTurnStep',
    },
    {
      title: 'Microsoft.FloatPrompt',
      description: 'This represents a dialog which gathers a number in a specified range',
      $ref: '#/definitions/Microsoft.FloatPrompt',
    },
    {
      title: 'Microsoft.IfElseStep',
      description: 'Step which conditionally decides which step to execute next.',
      $ref: '#/definitions/Microsoft.IfElseStep',
    },
    {
      title: 'Microsoft.IntegerPrompt',
      description: 'This represents a dialog which gathers a number in a specified range',
      $ref: '#/definitions/Microsoft.IntegerPrompt',
    },
    {
      title: 'Microsoft.IntentDialog',
      description: 'Configures a recognizer and the intent routes',
      $ref: '#/definitions/Microsoft.IntentDialog',
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
      description: 'Example regular expression recognizer.',
      $ref: '#/definitions/Microsoft.RegexRecognizer',
    },
    {
      title: 'Microsoft.SendActivityStep',
      description: 'This is a step which sends an activity to the user',
      $ref: '#/definitions/Microsoft.SendActivityStep',
    },
    {
      title: 'Microsoft.SendActivityTemplateStep',
      description: 'This is a step which sends an activity to the user',
      $ref: '#/definitions/Microsoft.SendActivityTemplateStep',
    },
    {
      title: 'Microsoft.SequenceDialog',
      description: 'Configures a data driven dialog via a collection of steps/dialogs.',
      $ref: '#/definitions/Microsoft.SequenceDialog',
    },
    {
      title: 'Microsoft.SetPropertyStep',
      description: 'This is a step which sets a property in memory to a value',
      $ref: '#/definitions/Microsoft.SetPropertyStep',
    },
    {
      title: 'Microsoft.SwitchStep',
      description: 'Step which conditionally decides which step to execute next.',
      $ref: '#/definitions/Microsoft.SwitchStep',
    },
    {
      title: 'Microsoft.TextPrompt',
      description: 'This represents a dialog which gathers a text from the user',
      $ref: '#/definitions/Microsoft.TextPrompt',
    },
  ],
  definitions: {
    'Microsoft.IActivityTemplate': {
      title: 'Microsoft ActivityTemplate',
      description:
        'Definition of Microsoft.IActivityTemplate which will be expanded by components that $implements it.',
      oneOf: [
        {
          type: 'string',
          title: 'string',
        },
      ],
      type: 'object',
    },
    'Microsoft.IDialog': {
      title: 'Microsoft IDialog',
      description: 'Definition of Microsoft.IDialog which will be expanded by components that $implements it.',
      oneOf: [
        {
          title: 'Microsoft.DateTimePrompt',
          description: 'This represents a dialog which gathers a DateTime in a specified range',
          $ref: '#/definitions/Microsoft.DateTimePrompt',
        },
        {
          title: 'Microsoft.FloatPrompt',
          description: 'This represents a dialog which gathers a number in a specified range',
          $ref: '#/definitions/Microsoft.FloatPrompt',
        },
        {
          title: 'Microsoft.IntegerPrompt',
          description: 'This represents a dialog which gathers a number in a specified range',
          $ref: '#/definitions/Microsoft.IntegerPrompt',
        },
        {
          title: 'Microsoft.IntentDialog',
          description: 'Configures a recognizer and the intent routes',
          $ref: '#/definitions/Microsoft.IntentDialog',
        },
        {
          title: 'Microsoft.SequenceDialog',
          description: 'Configures a data driven dialog via a collection of steps/dialogs.',
          $ref: '#/definitions/Microsoft.SequenceDialog',
        },
        {
          title: 'Microsoft.TextPrompt',
          description: 'This represents a dialog which gathers a text from the user',
          $ref: '#/definitions/Microsoft.TextPrompt',
        },
      ],
      type: 'object',
    },
    'Microsoft.IDialogStep': {
      title: 'Microsoft IDialogStep',
      description: 'Definition of Microsoft.IDialogStep which will be expanded by components that $implements it.',
      oneOf: [
        {
          title: 'Microsoft.CallDialog',
          description: 'Step which calls another dialog.',
          $ref: '#/definitions/Microsoft.CallDialog',
        },
        {
          title: 'Microsoft.CancelDialog',
          description: 'This is a step which cancels the current dialog, returning no result',
          $ref: '#/definitions/Microsoft.CancelDialog',
        },
        {
          title: 'Microsoft.ClearPropertyStep',
          description: 'This is a step which removes a property from memory',
          $ref: '#/definitions/Microsoft.ClearPropertyStep',
        },
        {
          title: 'Microsoft.EndDialog',
          description: 'This is a step which ends the current dialog, returning the result',
          $ref: '#/definitions/Microsoft.EndDialog',
        },
        {
          title: 'Microsoft.EndOfTurnStep',
          description: 'This is a step which ends the current turn',
          $ref: '#/definitions/Microsoft.EndOfTurnStep',
        },
        {
          title: 'Microsoft.IfElseStep',
          description: 'Step which conditionally decides which step to execute next.',
          $ref: '#/definitions/Microsoft.IfElseStep',
        },
        {
          title: 'Microsoft.SendActivityStep',
          description: 'This is a step which sends an activity to the user',
          $ref: '#/definitions/Microsoft.SendActivityStep',
        },
        {
          title: 'Microsoft.SendActivityTemplateStep',
          description: 'This is a step which sends an activity to the user',
          $ref: '#/definitions/Microsoft.SendActivityTemplateStep',
        },
        {
          title: 'Microsoft.SetPropertyStep',
          description: 'This is a step which sets a property in memory to a value',
          $ref: '#/definitions/Microsoft.SetPropertyStep',
        },
        {
          title: 'Microsoft.SwitchStep',
          description: 'Step which conditionally decides which step to execute next.',
          $ref: '#/definitions/Microsoft.SwitchStep',
        },
      ],
      type: 'object',
    },
    'Microsoft.IExpression': {
      title: 'Microsoft IActivityTemplate',
      description: 'Definition of Microsoft.IExpression which will be expanded by components that $implements it.',
      oneOf: [
        {
          type: 'string',
          title: 'string',
        },
      ],
      type: 'object',
    },
    'Microsoft.IRecognizer': {
      title: 'Microsoft IRecognizer',
      description: 'Definition of Microsoft.IRecognizer which will be expanded by components that $implements it.',
      oneOf: [
        {
          type: 'string',
          title: 'string',
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
          description: 'Example regular expression recognizer.',
          $ref: '#/definitions/Microsoft.RegexRecognizer',
        },
      ],
      type: 'object',
    },
    'Microsoft.DateTimePrompt': {
      $implements: ['Microsoft.IDialog'],
      title: 'DateTime prompt',
      description: 'This represents a dialog which gathers a DateTime in a specified range',
      type: 'object',
      additionalProperties: false,
      properties: {
        $ref: {
          type: 'string',
        },
        $type: {
          type: 'string',
          const: 'Microsoft.DateTimePrompt',
          default: 'Microsoft.DateTimePrompt',
        },
        $id: {
          type: 'string',
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
    'Microsoft.FloatPrompt': {
      $implements: ['Microsoft.IDialog'],
      title: 'Float  prompt',
      description: 'This represents a dialog which gathers a number in a specified range',
      type: 'object',
      additionalProperties: false,
      properties: {
        $ref: {
          type: 'string',
        },
        $type: {
          type: 'string',
          const: 'Microsoft.FloatPrompt',
        },
        $id: {
          type: 'string',
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
    'Microsoft.IntegerPrompt': {
      $implements: ['Microsoft.IDialog'],
      title: 'Integer prompt',
      description: 'This represents a dialog which gathers a number in a specified range',
      type: 'object',
      additionalProperties: false,
      properties: {
        $ref: {
          type: 'string',
        },
        $type: {
          type: 'string',
          const: 'Microsoft.IntegerPrompt',
        },
        $id: {
          type: 'string',
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
    'Microsoft.IntentDialog': {
      $implements: ['Microsoft.IDialog'],
      title: 'Intent Dialog',
      description: 'Configures a recognizer and the intent routes',
      type: 'object',
      additionalProperties: false,
      properties: {
        $ref: {
          type: 'string',
        },
        $type: {
          type: 'string',
          const: 'Microsoft.IntentDialog',
        },
        $id: {
          type: 'string',
        },
        recognizer: {
          $type: 'Microsoft.IRecognizer',
          $ref: '#/definitions/Microsoft.IRecognizer',
        },
        routes: {
          type: 'object',
          description: 'maps intent->IDialog',
          additionalProperties: {
            $type: 'Microsoft.IDialog',
            $ref: '#/definitions/Microsoft.IDialog',
          },
        },
      },
      required: ['recognizer', 'routes', '$type'],
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
    },
    'Microsoft.SequenceDialog': {
      $implements: ['Microsoft.IDialog'],
      title: 'Sequence Dialog',
      description: 'Configures a data driven dialog via a collection of steps/dialogs.',
      type: 'object',
      additionalProperties: false,
      properties: {
        $ref: {
          type: 'string',
        },
        $type: {
          type: 'string',
          const: 'Microsoft.SequenceDialog',
        },
        $id: {
          type: 'string',
        },
        sequence: {
          type: 'array',
          description: 'Sequence of steps or dialogs to execute',
          items: {
            $type: 'Microsoft.IDialogStep',
            $ref: '#/definitions/Microsoft.IDialogStep',
          },
        },
      },
      required: ['sequence', '$type'],
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
    },
    'Microsoft.TextPrompt': {
      $implements: ['Microsoft.IDialog'],
      $type: 'Microsoft.TextPrompt',
      title: 'Text prompt',
      description: 'This represents a dialog which gathers a text from the user',
      type: 'object',
      additionalProperties: false,
      properties: {
        $ref: {
          type: 'string',
        },
        $type: {
          type: 'string',
          const: 'Microsoft.TextPrompt',
        },
        $id: {
          type: 'string',
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
    'Microsoft.CallDialog': {
      $implements: ['Microsoft.IDialogStep'],
      title: 'Call Dialog',
      description: 'Step which calls another dialog.',
      type: 'object',
      additionalProperties: false,
      properties: {
        $ref: {
          type: 'string',
        },
        $type: {
          type: 'string',
          const: 'Microsoft.CallDialog',
        },
        $id: {
          type: 'string',
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
          $type: 'Microsoft.IExpression',
          title: 'Property',
          description: 'The property to bind to the dialog and store the result in',
          examples: ['user.name'],
          $ref: '#/definitions/Microsoft.IExpression',
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
      $implements: ['Microsoft.IDialogStep'],
      title: 'Cancel Dialog',
      description: 'This is a step which cancels the current dialog, returning no result',
      type: 'object',
      additionalProperties: false,
      properties: {
        $ref: {
          type: 'string',
        },
        $type: {
          type: 'string',
          const: 'Microsoft.CancelDialog',
        },
        $id: {
          type: 'string',
        },
      },
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      required: ['$type'],
    },
    'Microsoft.ClearPropertyStep': {
      $implements: ['Microsoft.IDialogStep'],
      title: 'Clear Property',
      description: 'This is a step which removes a property from memory',
      type: 'object',
      additionalProperties: false,
      properties: {
        $ref: {
          type: 'string',
        },
        $type: {
          type: 'string',
          const: 'Microsoft.ClearPropertyStep',
        },
        $id: {
          type: 'string',
        },
        property: {
          $type: 'Microsoft.IExpression',
          title: 'Property',
          description: 'Expression which is the property to clear.',
          $ref: '#/definitions/Microsoft.IExpression',
        },
      },
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      required: ['$type'],
    },
    'Microsoft.EndDialog': {
      $implements: ['Microsoft.IDialogStep'],
      title: 'End Dialog',
      description: 'This is a step which ends the current dialog, returning the result',
      type: 'object',
      additionalProperties: false,
      properties: {
        $ref: {
          type: 'string',
        },
        $type: {
          type: 'string',
          const: 'Microsoft.EndDialog',
        },
        $id: {
          type: 'string',
        },
        property: {
          $type: 'Microsoft.IExpression',
          title: 'Property',
          description: 'The property from dialog memory to return as the result',
          examples: ['user.name'],
          $ref: '#/definitions/Microsoft.IExpression',
        },
      },
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      required: ['$type'],
    },
    'Microsoft.EndOfTurnStep': {
      type: 'object',
      title: 'End Of Trun',
      description: 'This is a step which ends the current turn',
      $implements: ['Microsoft.IDialogStep'],
      additionalProperties: false,
      properties: {
        $ref: {
          type: 'string',
        },
        $type: {
          type: 'string',
          const: 'Microsoft.EndOfTurnStep',
        },
        $id: {
          type: 'string',
        },
      },
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      required: ['$type'],
    },
    'Microsoft.IfElseStep': {
      $implements: ['Microsoft.IDialogStep'],
      title: 'If Step',
      description: 'Step which conditionally decides which step to execute next.',
      type: 'object',
      additionalProperties: false,
      properties: {
        $ref: {
          type: 'string',
        },
        $type: {
          type: 'string',
          const: 'Microsoft.IfElseStep',
        },
        $id: {
          type: 'string',
        },
        ifTrue: {
          oneOf: [
            {
              $type: 'Microsoft.IDialogStep',
              $ref: '#/definitions/Microsoft.IDialogStep',
            },
            {
              type: 'array',
              items: {
                $type: 'Microsoft.IDialogStep',
                $ref: '#/definitions/Microsoft.IDialogStep',
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
              $type: 'Microsoft.IDialogStep',
              $ref: '#/definitions/Microsoft.IDialogStep',
            },
            {
              type: 'array',
              items: {
                $type: 'Microsoft.IDialogStep',
                $ref: '#/definitions/Microsoft.IDialogStep',
              },
              title: 'array',
            },
          ],
          title: 'If False',
          description: 'Step to execute if expression is false.',
        },
        condition: {
          $type: 'Microsoft.IExpression',
          title: 'Condition',
          description: 'Expression to evaluate.',
          examples: ['user.age > 3'],
          $ref: '#/definitions/Microsoft.IExpression',
        },
      },
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      required: ['$type'],
    },
    'Microsoft.SendActivityStep': {
      $implements: ['Microsoft.IDialogStep'],
      title: 'Send Activity Step',
      description: 'This is a step which sends an activity to the user',
      type: 'object',
      additionalProperties: false,
      properties: {
        $ref: {
          type: 'string',
        },
        $type: {
          type: 'string',
          const: 'Microsoft.SendActivityStep',
        },
        $id: {
          type: 'string',
        },
        activity: {
          description: 'An Activity is the basic communication type for the Bot Framework 3.0 protocol.',
          title: 'Activity',
          type: 'object',
          required: ['channelId', 'conversation', 'type'],
          properties: {
            type: {
              description:
                "Contains the activity type. Possible values include: 'message', 'contactRelationUpdate',\n'conversationUpdate', 'typing', 'endOfConversation', 'event', 'invoke', 'deleteUserData',\n'messageUpdate', 'messageDelete', 'installationUpdate', 'messageReaction', 'suggestion',\n'trace', 'handoff'",
              type: 'string',
              title: 'type',
            },
            id: {
              description: 'Contains an ID that uniquely identifies the activity on the channel.',
              type: 'string',
              title: 'id',
            },
            timestamp: {
              description:
                'Contains the date and time that the message was sent, in UTC, expressed in ISO-8601 format.',
              type: 'string',
              format: 'date-time',
              title: 'timestamp',
            },
            localTimestamp: {
              description:
                'Contains the date and time that the message was sent, in local time, expressed in ISO-8601\nformat.\nFor example, 2016-09-23T13:07:49.4714686-07:00.',
              type: 'string',
              format: 'date-time',
              title: 'localTimestamp',
            },
            localTimezone: {
              description:
                'Contains the name of the timezone in which the message, in local time, expressed in IANA Time\nZone database format.\nFor example, America/Los_Angeles.',
              type: 'string',
              title: 'localTimezone',
            },
            serviceUrl: {
              description: "Contains the URL that specifies the channel's service endpoint. Set by the channel.",
              type: 'string',
              title: 'serviceUrl',
            },
            channelId: {
              description: 'Contains an ID that uniquely identifies the channel. Set by the channel.',
              type: 'string',
              title: 'channelId',
            },
            from: {
              description: 'Identifies the sender of the message.',
              title: 'from',
              type: 'object',
              required: ['id', 'name'],
              properties: {
                id: {
                  description:
                    'Channel id for the user or bot on this channel (Example: joe@smith.com, or @joesmith or\n123456)',
                  type: 'string',
                  title: 'id',
                },
                name: {
                  description: 'Display friendly name',
                  type: 'string',
                  title: 'name',
                },
                aadObjectId: {
                  description: "This account's object ID within Azure Active Directory (AAD)",
                  type: 'string',
                  title: 'aadObjectId',
                },
                role: {
                  description:
                    "Role of the entity behind the account (Example: User, Bot, etc.). Possible values include:\n'user', 'bot'",
                  type: 'string',
                  title: 'role',
                },
              },
            },
            conversation: {
              description: 'Identifies the conversation to which the activity belongs.',
              title: 'conversation',
              type: 'object',
              required: ['conversationType', 'id', 'isGroup', 'name'],
              properties: {
                isGroup: {
                  description:
                    'Indicates whether the conversation contains more than two participants at the time the\nactivity was generated',
                  type: 'boolean',
                  title: 'isGroup',
                },
                conversationType: {
                  description:
                    'Indicates the type of the conversation in channels that distinguish between conversation types',
                  type: 'string',
                  title: 'conversationType',
                },
                id: {
                  description:
                    'Channel id for the user or bot on this channel (Example: joe@smith.com, or @joesmith or\n123456)',
                  type: 'string',
                  title: 'id',
                },
                name: {
                  description: 'Display friendly name',
                  type: 'string',
                  title: 'name',
                },
                aadObjectId: {
                  description: "This account's object ID within Azure Active Directory (AAD)",
                  type: 'string',
                  title: 'aadObjectId',
                },
                role: {
                  description:
                    "Role of the entity behind the account (Example: User, Bot, etc.). Possible values include:\n'user', 'bot'",
                  enum: ['bot', 'user'],
                  type: 'string',
                  title: 'role',
                },
              },
            },
            recipient: {
              description: 'Identifies the recipient of the message.',
              title: 'recipient',
              type: 'object',
              required: ['id', 'name'],
              properties: {
                id: {
                  description:
                    'Channel id for the user or bot on this channel (Example: joe@smith.com, or @joesmith or\n123456)',
                  type: 'string',
                  title: 'id',
                },
                name: {
                  description: 'Display friendly name',
                  type: 'string',
                  title: 'name',
                },
                aadObjectId: {
                  description: "This account's object ID within Azure Active Directory (AAD)",
                  type: 'string',
                  title: 'aadObjectId',
                },
                role: {
                  description:
                    "Role of the entity behind the account (Example: User, Bot, etc.). Possible values include:\n'user', 'bot'",
                  type: 'string',
                  title: 'role',
                },
              },
            },
            textFormat: {
              description:
                "Format of text fields Default:markdown. Possible values include: 'markdown', 'plain', 'xml'",
              type: 'string',
              title: 'textFormat',
            },
            attachmentLayout: {
              description:
                "The layout hint for multiple attachments. Default: list. Possible values include: 'list',\n'carousel'",
              type: 'string',
              title: 'attachmentLayout',
            },
            membersAdded: {
              description: 'The collection of members added to the conversation.',
              type: 'array',
              title: 'membersAdded',
              items: {
                description: 'Channel account information needed to route a message',
                title: 'ChannelAccount',
                type: 'object',
                required: ['id', 'name'],
                properties: {
                  id: {
                    description:
                      'Channel id for the user or bot on this channel (Example: joe@smith.com, or @joesmith or\n123456)',
                    type: 'string',
                    title: 'id',
                  },
                  name: {
                    description: 'Display friendly name',
                    type: 'string',
                    title: 'name',
                  },
                  aadObjectId: {
                    description: "This account's object ID within Azure Active Directory (AAD)",
                    type: 'string',
                    title: 'aadObjectId',
                  },
                  role: {
                    description:
                      "Role of the entity behind the account (Example: User, Bot, etc.). Possible values include:\n'user', 'bot'",
                    type: 'string',
                    title: 'role',
                  },
                },
              },
            },
            membersRemoved: {
              description: 'The collection of members removed from the conversation.',
              type: 'array',
              title: 'membersRemoved',
              items: {
                description: 'Channel account information needed to route a message',
                title: 'ChannelAccount',
                type: 'object',
                required: ['id', 'name'],
                properties: {
                  id: {
                    description:
                      'Channel id for the user or bot on this channel (Example: joe@smith.com, or @joesmith or\n123456)',
                    type: 'string',
                    title: 'id',
                  },
                  name: {
                    description: 'Display friendly name',
                    type: 'string',
                    title: 'name',
                  },
                  aadObjectId: {
                    description: "This account's object ID within Azure Active Directory (AAD)",
                    type: 'string',
                    title: 'aadObjectId',
                  },
                  role: {
                    description:
                      "Role of the entity behind the account (Example: User, Bot, etc.). Possible values include:\n'user', 'bot'",
                    type: 'string',
                    title: 'role',
                  },
                },
              },
            },
            reactionsAdded: {
              description: 'The collection of reactions added to the conversation.',
              type: 'array',
              title: 'reactionsAdded',
              items: {
                description: 'Message reaction object',
                title: 'MessageReaction',
                type: 'object',
                required: ['type'],
                properties: {
                  type: {
                    description: "Message reaction type. Possible values include: 'like', 'plusOne'",
                    type: 'string',
                    title: 'type',
                  },
                },
              },
            },
            reactionsRemoved: {
              description: 'The collection of reactions removed from the conversation.',
              type: 'array',
              title: 'reactionsRemoved',
              items: {
                description: 'Message reaction object',
                title: 'MessageReaction',
                type: 'object',
                required: ['type'],
                properties: {
                  type: {
                    description: "Message reaction type. Possible values include: 'like', 'plusOne'",
                    type: 'string',
                    title: 'type',
                  },
                },
              },
            },
            topicName: {
              description: 'The updated topic name of the conversation.',
              type: 'string',
              title: 'topicName',
            },
            historyDisclosed: {
              description: 'Indicates whether the prior history of the channel is disclosed.',
              type: 'boolean',
              title: 'historyDisclosed',
            },
            locale: {
              description:
                'A locale name for the contents of the text field.\nThe locale name is a combination of an ISO 639 two- or three-letter culture code associated\nwith a language\nand an ISO 3166 two-letter subculture code associated with a country or region.\nThe locale name can also correspond to a valid BCP-47 language tag.',
              type: 'string',
              title: 'locale',
            },
            text: {
              description: 'The text content of the message.',
              type: 'string',
              title: 'text',
            },
            speak: {
              description: 'The text to speak.',
              type: 'string',
              title: 'speak',
            },
            inputHint: {
              description:
                "Indicates whether your bot is accepting,\nexpecting, or ignoring user input after the message is delivered to the client. Possible\nvalues include: 'acceptingInput', 'ignoringInput', 'expectingInput'",
              type: 'string',
              title: 'inputHint',
            },
            summary: {
              description: 'The text to display if the channel cannot render cards.',
              type: 'string',
              title: 'summary',
            },
            suggestedActions: {
              description: 'The suggested actions for the activity.',
              title: 'suggestedActions',
              type: 'object',
              required: ['actions', 'to'],
              properties: {
                to: {
                  description:
                    'Ids of the recipients that the actions should be shown to.  These Ids are relative to the\nchannelId and a subset of all recipients of the activity',
                  type: 'array',
                  title: 'to',
                  items: {
                    type: 'string',
                  },
                },
                actions: {
                  description: 'Actions that can be shown to the user',
                  type: 'array',
                  title: 'actions',
                  items: {
                    description: 'A clickable action',
                    title: 'CardAction',
                    type: 'object',
                    required: ['title', 'type', 'value'],
                    properties: {
                      type: {
                        description:
                          "The type of action implemented by this button. Possible values include: 'openUrl', 'imBack',\n'postBack', 'playAudio', 'playVideo', 'showImage', 'downloadFile', 'signin', 'call',\n'payment', 'messageBack'",
                        type: 'string',
                        title: 'type',
                      },
                      title: {
                        description: 'Text description which appears on the button',
                        type: 'string',
                        title: 'title',
                      },
                      image: {
                        description: 'Image URL which will appear on the button, next to text label',
                        type: 'string',
                        title: 'image',
                      },
                      text: {
                        description: 'Text for this action',
                        type: 'string',
                        title: 'text',
                      },
                      displayText: {
                        description: '(Optional) text to display in the chat feed if the button is clicked',
                        type: 'string',
                        title: 'displayText',
                      },
                      value: {
                        description:
                          'Supplementary parameter for action. Content of this property depends on the ActionType',
                        title: 'value',
                      },
                      channelData: {
                        description: 'Channel-specific data associated with this action',
                        title: 'channelData',
                      },
                    },
                  },
                },
              },
            },
            attachments: {
              description: 'Attachments',
              type: 'array',
              title: 'attachments',
              items: {
                description: 'An attachment within an activity',
                title: 'Attachment',
                type: 'object',
                required: ['contentType'],
                properties: {
                  contentType: {
                    description: 'mimetype/Contenttype for the file',
                    type: 'string',
                    title: 'contentType',
                  },
                  contentUrl: {
                    description: 'Content Url',
                    type: 'string',
                    title: 'contentUrl',
                  },
                  content: {
                    description: 'Embedded content',
                    title: 'content',
                  },
                  name: {
                    description: '(OPTIONAL) The name of the attachment',
                    type: 'string',
                    title: 'name',
                  },
                  thumbnailUrl: {
                    description: '(OPTIONAL) Thumbnail associated with attachment',
                    type: 'string',
                    title: 'thumbnailUrl',
                  },
                },
              },
            },
            entities: {
              description: 'Represents the entities that were mentioned in the message.',
              type: 'array',
              title: 'entities',
              items: {
                description: 'Metadata object pertaining to an activity',
                title: 'Entity',
                type: 'object',
                required: ['type'],
                properties: {
                  type: {
                    description: 'Type of this entity (RFC 3987 IRI)',
                    type: 'string',
                    title: 'type',
                  },
                },
              },
            },
            channelData: {
              description: 'Contains channel-specific content.',
              title: 'channelData',
            },
            action: {
              description:
                "Indicates whether the recipient of a contactRelationUpdate was added or removed from the\nsender's contact list.",
              type: 'string',
              title: 'action',
            },
            replyToId: {
              description: 'Contains the ID of the message to which this message is a reply.',
              type: 'string',
              title: 'replyToId',
            },
            label: {
              description: 'A descriptive label for the activity.',
              type: 'string',
              title: 'label',
            },
            valueType: {
              description: "The type of the activity's value object.",
              type: 'string',
              title: 'valueType',
            },
            value: {
              description: 'A value that is associated with the activity.',
              title: 'value',
            },
            name: {
              description: 'The name of the operation associated with an invoke or event activity.',
              type: 'string',
              title: 'name',
            },
            relatesTo: {
              description: 'A reference to another conversation or activity.',
              title: 'relatesTo',
              type: 'object',
              required: ['bot', 'channelId', 'conversation', 'serviceUrl'],
              properties: {
                activityId: {
                  description: '(Optional) ID of the activity to refer to',
                  type: 'string',
                  title: 'activityId',
                },
                user: {
                  description: '(Optional) User participating in this conversation',
                  title: 'user',
                  type: 'object',
                  required: ['id', 'name'],
                  properties: {
                    id: {
                      description:
                        'Channel id for the user or bot on this channel (Example: joe@smith.com, or @joesmith or\n123456)',
                      type: 'string',
                      title: 'id',
                    },
                    name: {
                      description: 'Display friendly name',
                      type: 'string',
                      title: 'name',
                    },
                    aadObjectId: {
                      description: "This account's object ID within Azure Active Directory (AAD)",
                      type: 'string',
                      title: 'aadObjectId',
                    },
                    role: {
                      description:
                        "Role of the entity behind the account (Example: User, Bot, etc.). Possible values include:\n'user', 'bot'",
                      type: 'string',
                      title: 'role',
                    },
                  },
                },
                bot: {
                  description: 'Bot participating in this conversation',
                  title: 'bot',
                  type: 'object',
                  required: ['id', 'name'],
                  properties: {
                    id: {
                      description:
                        'Channel id for the user or bot on this channel (Example: joe@smith.com, or @joesmith or\n123456)',
                      type: 'string',
                      title: 'id',
                    },
                    name: {
                      description: 'Display friendly name',
                      type: 'string',
                      title: 'name',
                    },
                    aadObjectId: {
                      description: "This account's object ID within Azure Active Directory (AAD)",
                      type: 'string',
                      title: 'aadObjectId',
                    },
                    role: {
                      description:
                        "Role of the entity behind the account (Example: User, Bot, etc.). Possible values include:\n'user', 'bot'",
                      type: 'string',
                      title: 'role',
                    },
                  },
                },
                conversation: {
                  description: 'Conversation reference',
                  title: 'conversation',
                  type: 'object',
                  required: ['conversationType', 'id', 'isGroup', 'name'],
                  properties: {
                    isGroup: {
                      description:
                        'Indicates whether the conversation contains more than two participants at the time the\nactivity was generated',
                      type: 'boolean',
                      title: 'isGroup',
                    },
                    conversationType: {
                      description:
                        'Indicates the type of the conversation in channels that distinguish between conversation types',
                      type: 'string',
                      title: 'conversationType',
                    },
                    id: {
                      description:
                        'Channel id for the user or bot on this channel (Example: joe@smith.com, or @joesmith or\n123456)',
                      type: 'string',
                      title: 'id',
                    },
                    name: {
                      description: 'Display friendly name',
                      type: 'string',
                      title: 'name',
                    },
                    aadObjectId: {
                      description: "This account's object ID within Azure Active Directory (AAD)",
                      type: 'string',
                      title: 'aadObjectId',
                    },
                    role: {
                      description:
                        "Role of the entity behind the account (Example: User, Bot, etc.). Possible values include:\n'user', 'bot'",
                      enum: ['bot', 'user'],
                      type: 'string',
                      title: 'role',
                    },
                  },
                },
                channelId: {
                  description: 'Channel ID',
                  type: 'string',
                  title: 'channelId',
                },
                serviceUrl: {
                  description:
                    'Service endpoint where operations concerning the referenced conversation may be performed',
                  type: 'string',
                  title: 'serviceUrl',
                },
              },
            },
            code: {
              description:
                "The a code for endOfConversation activities that indicates why the conversation ended.\nPossible values include: 'unknown', 'completedSuccessfully', 'userCancelled', 'botTimedOut',\n'botIssuedInvalidMessage', 'channelFailed'",
              type: 'string',
              title: 'code',
            },
            expiration: {
              description:
                'The time at which the activity should be considered to be "expired" and should not be\npresented to the recipient.',
              type: 'string',
              format: 'date-time',
              title: 'expiration',
            },
            importance: {
              description: "The importance of the activity. Possible values include: 'low', 'normal', 'high'",
              type: 'string',
              title: 'importance',
            },
            deliveryMode: {
              description:
                "A delivery hint to signal to the recipient alternate delivery paths for the activity.\nThe default delivery mode is \"default\". Possible values include: 'normal', 'notification'",
              type: 'string',
              title: 'deliveryMode',
            },
            listenFor: {
              description: 'List of phrases and references that speech and language priming systems should listen for',
              type: 'array',
              title: 'listenFor',
              items: {
                type: 'string',
              },
            },
            textHighlights: {
              description:
                'The collection of text fragments to highlight when the activity contains a ReplyToId value.',
              type: 'array',
              title: 'textHighlights',
              items: {
                description: 'Refers to a substring of content within another field',
                title: 'TextHighlight',
                type: 'object',
                required: ['occurrence', 'text'],
                properties: {
                  text: {
                    description: 'Defines the snippet of text to highlight',
                    type: 'string',
                    title: 'text',
                  },
                  occurrence: {
                    description: 'Occurrence of the text field within the referenced text, if multiple exist.',
                    type: 'number',
                    title: 'occurrence',
                  },
                },
              },
            },
            semanticAction: {
              description: 'An optional programmatic action accompanying this request',
              title: 'semanticAction',
              type: 'object',
              required: ['entities', 'id'],
              properties: {
                id: {
                  description: 'ID of this action',
                  type: 'string',
                  title: 'id',
                },
                entities: {
                  description: 'Entities associated with this action',
                  type: 'object',
                  title: 'entities',
                  additionalProperties: {
                    description: 'Metadata object pertaining to an activity',
                    title: 'Entity',
                    type: 'object',
                    required: ['type'],
                    properties: {
                      type: {
                        description: 'Type of this entity (RFC 3987 IRI)',
                        type: 'string',
                        title: 'type',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      required: ['$type'],
    },
    'Microsoft.SendActivityTemplateStep': {
      $implements: ['Microsoft.IDialogStep'],
      title: 'Send Activity Step',
      description: 'This is a step which sends an activity to the user',
      type: 'object',
      additionalProperties: false,
      properties: {
        $ref: {
          type: 'string',
        },
        $type: {
          type: 'string',
          const: 'Microsoft.SendActivityTemplateStep',
        },
        $id: {
          type: 'string',
        },
        activity: {
          $type: 'Microsoft.IActivityTemplate',
          title: 'Activity',
          description: 'Activity to send to the user.',
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
    'Microsoft.SetPropertyStep': {
      $implements: ['Microsoft.IDialogStep'],
      title: 'Set Property',
      description: 'This is a step which sets a property in memory to a value',
      type: 'object',
      additionalProperties: false,
      properties: {
        $ref: {
          type: 'string',
        },
        $type: {
          type: 'string',
          const: 'Microsoft.SetPropertyStep',
        },
        $id: {
          type: 'string',
        },
        property: {
          $type: 'Microsoft.IExpression',
          title: 'Property',
          description: 'Expression which is the property to set.',
          $ref: '#/definitions/Microsoft.IExpression',
        },
        value: {
          $type: 'Microsoft.IExpression',
          title: 'Value',
          description: 'Expression which is the value to use.',
          $ref: '#/definitions/Microsoft.IExpression',
        },
      },
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      required: ['$type'],
    },
    'Microsoft.SwitchStep': {
      $implements: ['Microsoft.IDialogStep'],
      title: 'Switch Step',
      description: 'Step which conditionally decides which step to execute next.',
      type: 'object',
      additionalProperties: false,
      properties: {
        $ref: {
          type: 'string',
        },
        $type: {
          type: 'string',
          const: 'Microsoft.SwitchStep',
        },
        $id: {
          type: 'string',
        },
        condition: {
          $type: 'Microsoft.IExpression',
          title: 'Condition',
          description: 'Expression to evaluate.',
          examples: ['user.age > 3'],
          $ref: '#/definitions/Microsoft.IExpression',
        },
        cases: {
          type: 'object',
          title: 'Cases',
          description: 'Step to execute if expression is true.',
          additionalProperties: {
            oneOf: [
              {
                $type: 'Microsoft.IDialogStep',
                $ref: '#/definitions/Microsoft.IDialogStep',
              },
              {
                type: 'array',
                items: {
                  $type: 'Microsoft.IDialogStep',
                  $ref: '#/definitions/Microsoft.IDialogStep',
                },
                title: 'array',
              },
            ],
          },
        },
        ignoreCase: {
          type: 'boolean',
          title: 'Ignore carse',
          description: 'Control whether case comparison is case sensitive.',
        },
      },
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
      required: ['$type'],
    },
    'Microsoft.LuisRecognizer': {
      $implements: ['Microsoft.IRecognizer'],
      title: 'LUIS Recognizer',
      description: 'LUIS recognizer.',
      type: 'object',
      additionalProperties: false,
      properties: {
        $ref: {
          type: 'string',
        },
        $type: {
          type: 'string',
          const: 'Microsoft.LuisRecognizer',
        },
        $id: {
          type: 'string',
        },
        application: {
          type: 'object',
          required: ['applicationId', 'endpoint', 'endpointKey'],
          properties: {
            applicationId: {
              type: 'string',
            },
            endpoint: {
              type: 'string',
            },
            endpointKey: {
              type: 'string',
            },
          },
        },
        priority: {
          type: 'string',
        },
      },
      required: ['applicationId', '$type'],
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
    },
    'Microsoft.QnaMakerRecognizer': {
      $implements: ['Microsoft.IRecognizer'],
      title: 'QnAMaker.ai Recognizer',
      description: 'This represents a configuration of the QNAMaker as a recognizer',
      type: 'object',
      additionalProperties: false,
      properties: {
        $ref: {
          type: 'string',
        },
        $type: {
          type: 'string',
          const: 'Microsoft.QnaMakerRecognizer',
        },
        $id: {
          type: 'string',
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
      required: ['applicationId', 'endpoint', '$type'],
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
    },
    'Microsoft.RegexRecognizer': {
      $implements: ['Microsoft.IRecognizer'],
      title: 'Regular Expression Recognizer',
      description: 'Example regular expression recognizer.',
      type: 'object',
      additionalProperties: false,
      properties: {
        $ref: {
          type: 'string',
        },
        $type: {
          type: 'string',
          const: 'Microsoft.RegexRecognizer',
        },
        $id: {
          type: 'string',
        },
        pattern: {
          type: 'string',
        },
      },
      required: ['pattern', '$type'],
      patternProperties: {
        '^\\$': {
          type: 'string',
        },
      },
    },
  },
};
