// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { LgTemplate } from '@bfc/shared';

import { PartialStructuredResponse } from '../../lg/types';
import { getStructuredResponseFromTemplate, structuredResponseToString } from '../structuredResponse';

describe('structuresResponse', () => {
  it('getStructuredResponseFromTemplate: should return undefined if the template is undefined', () => {
    const response = getStructuredResponseFromTemplate();
    expect(response).toBeUndefined();
  });
  it('getStructuredResponseFromTemplate: should return undefined if the template body is undefined', () => {
    const response = getStructuredResponseFromTemplate({} as LgTemplate);
    expect(response).toBeUndefined();
  });
  it('getStructuredResponseFromTemplate: should return undefined if the template type is not activity', () => {
    const lgTemplate: LgTemplate = {
      name: 'card',
      parameters: [],
      body: '[Herocard ...]',
      properties: {
        $type: 'Herocard',
      },
    };
    const response = getStructuredResponseFromTemplate(lgTemplate);
    expect(response).toBeUndefined();
  });
  it('getStructuredResponseFromTemplate: should return structured response for an activity', () => {
    const lgTemplate = {
      name: 'card',
      parameters: [],
      body: '[Activity ...]',
      properties: {
        $type: 'Activity',
        Text: 'Hello world!',
        Speak: '${Activity_speak()}',
        Attachments: ['${Herocard()}', '${AdaptiveCard()}', '${ThumbnailCard()}'],
        SuggestedActions: ['option1', 'option2', 'option3'],
      },
    };
    const response = getStructuredResponseFromTemplate(lgTemplate);
    expect(response).toEqual(
      expect.objectContaining({
        Text: { kind: 'Text', value: ['Hello world!'], valueType: 'direct' },
        Speak: { kind: 'Speak', value: ['${Activity_speak()}'], valueType: 'template' },
        Attachments: {
          kind: 'Attachments',
          value: ['${Herocard()}', '${AdaptiveCard()}', '${ThumbnailCard()}'],
          valueType: 'direct',
        },
        SuggestedActions: {
          kind: 'SuggestedActions',
          value: ['option1', 'option2', 'option3'],
        },
      })
    );
  });

  it('structuredResponseToString: should convert a structured Response to a string', () => {
    const structuredResponse: PartialStructuredResponse = {
      Text: { kind: 'Text', value: ['Hello world!'], valueType: 'direct' },
      Speak: { kind: 'Speak', value: ['${Activity_speak()}'], valueType: 'template' },
      Attachments: {
        kind: 'Attachments',
        value: ['${Herocard()}', '${AdaptiveCard()}', '${ThumbnailCard()}'],
        valueType: 'direct',
      },
      SuggestedActions: {
        kind: 'SuggestedActions',
        value: ['option1', 'option2', 'option3'],
      },
    };
    expect(structuredResponseToString(structuredResponse)).toEqual(`[Activity
    Text = Hello world!
    Speak = \${Activity_speak()}
    Attachments = \${Herocard()} | \${AdaptiveCard()} | \${ThumbnailCard()}
    SuggestedActions = option1 | option2 | option3
]
`);
  });

  it('structuredResponseToString: should return an empty string when the response template is an empty object', () => {
    const structuredResponse: PartialStructuredResponse = {};
    expect(structuredResponseToString(structuredResponse)).toEqual('');
  });

  it('structuredResponseToString: should return an empty string when the response template values are empty', () => {
    const structuredResponse: PartialStructuredResponse = {
      Text: { kind: 'Text', value: [], valueType: 'direct' },
      Speak: { kind: 'Speak', value: [], valueType: 'template' },
      Attachments: {
        kind: 'Attachments',
        value: [],
        valueType: 'direct',
      },
      SuggestedActions: {
        kind: 'SuggestedActions',
        value: [],
      },
    };
    expect(structuredResponseToString(structuredResponse)).toEqual('');
  });
});
