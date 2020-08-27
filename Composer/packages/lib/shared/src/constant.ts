// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const SensitiveProperties = [
  'MicrosoftAppPassword',
  'luis.authoringKey',
  'luis.endpointKey',
  'qna.subscriptionKey',
  'qna.endpointKey',
];
export const FieldNames = {
  Events: 'triggers',
  Actions: 'actions',
  ElseActions: 'elseActions',
  Condition: 'condition',
  DefaultCase: 'default',
  Cases: 'cases',
};
export const defaultPublishConfig = {
  name: 'default',
  type: 'localpublish',
  configuration: JSON.stringify({}),
};

export const LUISLocales = [
  'en-us',
  'ar-ar',
  'zh-cn',
  'nl-nl',
  'fr-fr',
  'fr-ca',
  'de-de',
  'gu-in',
  'hi-in',
  'it-it',
  'ja-jp',
  'ko-kr',
  'mr-in',
  'pt-br',
  'es-es',
  'es-mx',
  'ta-in',
  'te-in',
  'tr-tr',
];

const adaptiveCardJsonBody =
  '-```\
\n{\
\n      "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",\
\n      "version": "1.0",\
\n      "type": "AdaptiveCard",\
\n      "speak": "",\
\n      "body": [\
\n          {\
\n              "type": "TextBlock",\
\n              "text": "${whichOneDidYouMean()}",\
\n              "weight": "Bolder"\
\n          },\
\n          {\
\n              "type": "TextBlock",\
\n              "text": "${pickOne()}",\
\n              "separator": "true"\
\n          },\
\n          {\
\n              "type": "Input.ChoiceSet",\
\n              "placeholder": "Placeholder text",\
\n              "id": "userChosenIntent",\
\n              "choices": [\
\n                           {\
\n                               "title": "${getIntentReadBack()}",\
\n                               "value": "luisResult"\
\n                           },\
\n                           {\
\n                               "title": "${getAnswerReadBack()}",\
\n                               "value": "qnaResult"\
\n                           },\
\n                           {\
\n                               "title": "None of the above",\
\n                               "value": "none"\
\n                           }\
\n             ],\
\n             "style": "expanded",\
\n             "value": "luis"\
\n         },\
\n         {\
\n             "type": "ActionSet",\
\n             "actions": [\
\n                {\
\n                     "type": "Action.Submit",\
\n                     "title": "Submit",\
\n                     "data": {\
\n                   "intent": "chooseIntentCardResponse"\
\n                }\
\n         }\
\n       ]\
\n     }\
\n    ]\
\n}\
```';

const whichOneDidYouMeanBody = `\
- I'm not sure which one you mean.
- Hmmm, I find that to be ambiguous.
`;

const pickOne = `\
- Can you pick one ?
- Can you help clarify by choosing one ?
`;

const getIntentReadBack = `\
- SWITCH : \${toLower(dialog.luisResult.intent)}
- CASE : \${'GetUserProfile'}
  - Start filling in your profile(GetUserProfile intent)
- DEFAULT :
  - \${dialog.luisResult.intent}
`;

const getAnswerReadBack = `- See an answer from the Knowledge Base
`;

export const LgTemplateSamples = {
  ['adaptiveCardJson']: {
    name: 'AdaptiveCardJson',
    body: adaptiveCardJsonBody,
  },
  ['whichOneDidYouMean']: {
    name: `whichOneDidYouMean`,
    body: whichOneDidYouMeanBody,
  },
  ['pickOne']: {
    name: 'pickOne',
    body: pickOne,
  },
  ['getAnswerReadBack']: {
    name: 'getAnswerReadBack',
    body: getAnswerReadBack,
  },
  ['getIntentReadBack']: {
    name: 'getIntentReadBack',
    body: getIntentReadBack,
  },
  TextInputPromptForOnChooseIntent: (designerId) => {
    return {
      name: `TextInput_Prompt_${designerId}`,
      body: `[Activity
    Attachments = \${json(AdaptiveCardJson())}
]
`,
    };
  },
  SendActivityForOnChooseIntent: (designerId) => {
    return {
      name: `SendActivity_${designerId}`,
      body: '- Sure, no worries.\n',
    };
  },
  TextInputPromptForQnAMatcher: (designerId) => {
    return {
      name: `TextInput_Prompt_${designerId}`,
      body: `[Activity
    Text = \${expandText(@answer)}
    SuggestedActions = \${foreach(turn.recognized.answers[0].context.prompts, x, x.displayText)}
]
`,
    };
  },
  SendActivityForQnAMatcher: (designerId) => {
    return {
      name: `SendActivity_${designerId}`,
      body: '- ${expandText(@answer)}\n',
    };
  },
};
