// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const QnABotTemplateId = 'QnASample';

export const emptyBotNpmTemplateName = '@microsoft/generator-microsoft-bot-empty';

export const SensitiveProperties = [
  'MicrosoftAppPassword',
  'luis.endpointKey',
  'qna.endpointKey',
  'luis.authoringKey',
  'qna.subscriptionKey',
];

export const RootBotManagedProperties = [
  'luis.authoringKey',
  'luis.authoringRegion',
  'qna.subscriptionKey',
  'luis.endpointKey',
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

export const QnALocales = [
  'ar',
  'ar-dz',
  'ar-bh',
  'ar-eg',
  'ar-iq',
  'ar-jo',
  'ar-kw',
  'ar-lb',
  'ar-ly',
  'ar-ma',
  'ar-om',
  'ar-qa',
  'ar-sa',
  'ar-sy',
  'ar-tn',
  'ar-ae',
  'ar-ye',
  'hy',
  'hy-am',
  'bn',
  'bn-bd',
  'bn-in',
  'eu',
  'eu-es',
  'bg',
  'bg-bg',
  'ca',
  'ca-es',
  'zh',
  'zh-hans',
  'zh-cn',
  'zh-sg',
  'zh-hant',
  'zh-hk',
  'zh-mo',
  'zh-tw',
  'hr',
  'hr-ba',
  'hr-hr',
  'cs',
  'cs-cz',
  'da',
  'da-dk',
  'nl',
  'nl-be',
  'nl-nl',
  'en',
  'en-as',
  'en-ai',
  'en-ag',
  'en-au',
  'en-at',
  'en-bs',
  'en-bb',
  'en-be',
  'en-bz',
  'en-bm',
  'en-bw',
  'en-io',
  'en-vg',
  'en-bi',
  'en-cm',
  'en-ca',
  'en-029',
  'en-ky',
  'en-cx',
  'en-cc',
  'en-ck',
  'en-cy',
  'en-dk',
  'en-dm',
  'en-er',
  'en-150',
  'en-fk',
  'en-fj',
  'en-fi',
  'en-gm',
  'en-de',
  'en-gh',
  'en-gi',
  'en-gd',
  'en-gu',
  'en-gg',
  'en-gy',
  'en-hk',
  'en-in',
  'en-id',
  'en-ie',
  'en-im',
  'en-il',
  'en-jm',
  'en-je',
  'en-ke',
  'en-ki',
  'en-ls',
  'en-lr',
  'en-mo',
  'en-mg',
  'en-mw',
  'en-my',
  'en-mt',
  'en-mh',
  'en-mu',
  'en-fm',
  'en-ms',
  'en-na',
  'en-nr',
  'en-nl',
  'en-nz',
  'en-ng',
  'en-nu',
  'en-nf',
  'en-mp',
  'en-pk',
  'en-pw',
  'en-pg',
  'en-ph',
  'en-pn',
  'en-pr',
  'en-rw',
  'en-kn',
  'en-lc',
  'en-vc',
  'en-ws',
  'en-sc',
  'en-sl',
  'en-sg',
  'en-sx',
  'en-si',
  'en-sb',
  'en-za',
  'en-ss',
  'en-sh',
  'en-sd',
  'en-sz',
  'en-se',
  'en-ch',
  'en-tz',
  'en-tk',
  'en-to',
  'en-tt',
  'en-tc',
  'en-tv',
  'en-um',
  'en-vi',
  'en-ug',
  'en-gb',
  'en-us',
  'en-vu',
  'en-001',
  'en-zm',
  'en-zw',
  'et',
  'et-ee',
  'fi',
  'fi-fi',
  'fr',
  'fr-be',
  'fr-cm',
  'fr-ca',
  'fr-029',
  'fr-ci',
  'fr-fr',
  'fr-ht',
  'fr-lu',
  'fr-ml',
  'fr-mc',
  'fr-ma',
  'fr-re',
  'fr-sn',
  'fr-ch',
  'fr-cd',
  'gl',
  'gl-es',
  'de',
  'de-at',
  'de-de',
  'de-li',
  'de-lu',
  'de-ch',
  'el',
  'el-gr',
  'gu',
  'gu-in',
  'he',
  'he-il',
  'hi',
  'hi-in',
  'hu',
  'hu-hu',
  'is',
  'is-is',
  'id',
  'id-id',
  'ga',
  'ga-ie',
  'it',
  'it-it',
  'it-ch',
  'ja',
  'ja-jp',
  'kn',
  'kn-in',
  'ko',
  'ko-kr',
  'lv',
  'lv-lv',
  'lt',
  'lt-lt',
  'ml',
  'ml-in',
  'ms',
  'ms-bn',
  'ms-my',
  'no',
  'nb',
  'nb-no',
  'nn',
  'nn-no',
  'pl',
  'pl-pl',
  'pt',
  'pt-br',
  'pt-pt',
  'pa',
  'pa-arab',
  'pa-in',
  'pa-arab-pk',
  'ro',
  'ro-md',
  'ro-ro',
  'ru',
  'ru-md',
  'ru-ru',
  'sr',
  'sr-cyrl',
  'sr-cyrl-ba',
  'sr-cyrl-me',
  'sr-cyrl-rs',
  'sr-latn',
  'sr-latn-ba',
  'sr-latn-me',
  'sr-latn-rs',
  'sk',
  'sk-sk',
  'sl',
  'sl-si',
  'es',
  'es-ar',
  'es-bo',
  'es-cl',
  'es-co',
  'es-cr',
  'es-cu',
  'es-do',
  'es-ec',
  'es-sv',
  'es-gt',
  'es-hn',
  'es-419',
  'es-mx',
  'es-ni',
  'es-pa',
  'es-py',
  'es-pe',
  'es-pr',
  'es-es',
  'es-us',
  'es-uy',
  'es-ve',
  'sv',
  'sv-fi',
  'sv-se',
  'ta',
  'ta-in',
  'ta-lk',
  'te',
  'te-in',
  'th',
  'th-th',
  'tr',
  'tr-tr',
  'uk',
  'uk-ua',
  'ur',
  'ur-in',
  'ur-pk',
  'vi',
  'vi-vn',
];

const adaptiveCardJsonBody =
  '-```\
\n{\
\n      "$schema",\
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
