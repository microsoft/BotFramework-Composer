// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { renderHook } from '@botframework-composer/test-utils/lib/hooks';
import { LgFile } from '@botframework-composer/types';

import { useLgTemplate } from '../LgWidget/useLgTemplate';

jest.mock('@bfc/extension-client', () => {
  const templateBodyWithStructuredResponse = `
# SendActivity_rndmId_text()
- This is a somewhat long text we are trying to check
- \`\`\`1test
2test
3test\`\`\`

# SendActivity_rndmId_speak()
- \`\`\`sp1
sp1.1\`\`\`
- sp2
- sp3

# SendActivity_rndmId()
[Activity
    Text = $\{SendActivity_rndmId_text()}
    Speak = $\{SendActivity_rndmId_speak()}
    Attachments = $\{SendActivity_rndmId_attachment_1emFAz()} | $\{SendActivity_rndmId_attachment_pM3MvT()}
    SuggestedActions = Ok | Cancel
]

# SendActivity_rndmId_attachment_1emFAz()
> To learn more Adaptive Cards format, read the documentation at
> https://docs.microsoft.com/en-us/adaptive-cards/getting-started/bots
- \`\`\`$\{json({
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "version": "1.2",
  "type": "AdaptiveCard",
  "body": [
    {
      "type": "TextBlock",
      "text": "default text",
      "weight": "bolder",
      "isSubtle": false
    }
  ]
})}\`\`\`
# SendActivity_rndmId_attachment_pM3MvT()
[HeroCard
  title = MyTitle
]`;

  const templates = [
    {
      name: 'SendActivity_rndmId',
      body: `[Activity
  Text = $\{SendActivity_rndmId_text()}
  Speak = $\{SendActivity_rndmId_speak()}
  Attachments = $\{SendActivity_rndmId_attachment_1emFAz()} | $\{SendActivity_rndmId_attachment_pM3MvT()}
  SuggestedActions = Ok | Cancel
]`,
      properties: {
        $type: 'Activity',
        Text: '${SendActivity_rndmId_text()}',
        Speak: '${SendActivity_rndmId_speak()}',
        Attachments: ['${SendActivity_rndmId_attachment_1emFAz()}', '${SendActivity_rndmId_attachment_pM3MvT()'],
        SuggestedActions: ['Ok', 'Cancel'],
      },
    },
    {
      name: 'SendActivity_rndmId_text',
      body: `- This is a somewhat long text we are trying to check
- \`\`\`1test
2test
3test\`\`\``,
    },
    {
      name: 'SendActivity_rndmId_speak',
      body: `- \`\`\`sp1
sp1.1\`\`\`
- sp2
- sp3`,
    },
    {
      name: 'SendActivity_rndmId_attachment_1emFAz',
      body: `> To learn more Adaptive Cards format, read the documentation at
> https://docs.microsoft.com/en-us/adaptive-cards/getting-started/bots
- \`\`\`$\{json({
  $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
  version: '1.2',
  type: 'AdaptiveCard',
  body: [
    {
      type: 'TextBlock',
      text: 'default text',
      weight: 'bolder',
      isSubtle: false,
    },
  ],
})}\`\`\``,
    },
    {
      name: 'SendActivity_rndmId_attachment_pM3MvT',
      body: `[HeroCard
  title = MyTitle
]`,
      properties: {
        $type: 'HeroCard',
        title: 'MyTitle',
      },
    },
    {
      name: 'SendActivity_rndmId2',
      body: `- test1\n-test2`,
    },
  ];

  return {
    useShellApi: () => ({
      lgFiles: [
        {
          id: 'dialog.en-us',
          content: templateBodyWithStructuredResponse,
          templates,
          allTemplates: templates,
        },
      ] as LgFile[],
      locale: 'en-us',
    }),
  };
});

const expectedResult = {
  Text: { value: 'This is a somewhat long text we are trying to check', moreCount: 1 },
  Speak: { value: 'sp1↵sp1.1', moreCount: 2 },
  Attachments: {
    value:
      "> To learn more Adaptive Cards format, read the documentation at\n> https://docs.microsoft.com/en-us/adaptive-cards/getting-started/bots\n- ```${json({\n  $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',\n  version: '1.2',\n  type: 'AdaptiveCard',\n  body: [\n    {\n      type: 'TextBlock',\n      text: 'default text',\n      weight: 'bolder',\n      isSubtle: false,\n    },\n  ],\n})}```",
    moreCount: 1,
  },
  SuggestedActions: { value: 'Ok', moreCount: 1 },
};

describe('useLgTemplate', () => {
  it('Should convert structured response to LgWidget rich data', () => {
    const { result } = renderHook(() => useLgTemplate('${SendActivity_rndmId()}'));
    expect(result.current).toEqual(expectedResult);
  });

  it('Should return template body when it is not structured response', () => {
    const { result } = renderHook(() => useLgTemplate('${SendActivity_rndmId2()}'));
    expect(result.current).toBe(`- test1\n-test2`);
  });
});
