// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/shared';

import {
  generateOtherActivities,
  generateActivity,
  generateActivities,
  getDefinitions,
  generateDispatchModels,
} from '../generateSkillManifest';

const dialogSchema = {
  id: 'test',
  content: {
    type: 'object',
    properties: {
      age: {
        title: 'User Age',
        $ref: '#/definitions/integerExpression',
      },
    },
    $result: {
      type: 'object',
      properties: {
        title: 'Dog Years',
        type: 'integer',
      },
    },
    definitions: {
      equalsExpression: {
        $role: 'expression',
        type: 'string',
      },
      integerExpression: {
        oneOf: [
          {
            type: 'string',
            title: 'String',
          },
          {
            $ref: '#/definitions/equalsExpression',
          },
        ],
      },
    },
  },
};

describe('generateOtherActivities', () => {
  it('generateOtherActivities should return other activity', () => {
    expect(generateOtherActivities(SDKKinds.OnConversationUpdateActivity)).toEqual(
      expect.objectContaining({
        conversationUpdate: {
          type: 'conversationUpdate',
        },
      })
    );

    expect(generateOtherActivities(SDKKinds.OnEndOfConversationActivity)).toEqual(
      expect.objectContaining({
        endOfConversation: {
          type: 'endOfConversation',
        },
      })
    );

    expect(generateOtherActivities(SDKKinds.OnIntent)).toEqual(
      expect.objectContaining({
        message: {
          type: 'message',
        },
      })
    );
  });
});

describe('generateActivity', () => {
  it('should return simple activity when there is no dialog schema', () => {
    const dialogSchemas = [];
    const dialog: any = { id: 'test', content: { $designer: {} } };
    const result = generateActivity(dialogSchemas, dialog);
    expect(result).toEqual(
      expect.objectContaining({
        test: {
          type: 'event',
          name: 'test',
        },
      })
    );
  });

  it('should return activity that includes value and result when dialog schema is available', () => {
    const dialogSchemas = [dialogSchema];
    const dialog: any = { id: 'test', content: { $designer: { description: 'Test Dialog' } } };
    const result = generateActivity(dialogSchemas, dialog);
    expect(result).toEqual(
      expect.objectContaining({
        test: {
          type: 'event',
          name: 'test',
          description: 'Test Dialog',
          value: {
            type: 'object',
            properties: {
              age: {
                title: 'User Age',
                $ref: '#/definitions/integerExpression',
              },
            },
          },
          resultValue: {
            type: 'object',
            properties: {
              title: 'Dog Years',
              type: 'integer',
            },
          },
        },
      })
    );
  });
});

describe('generateActivities', () => {
  it('should return an empty object when there are no selected dialogs or triggers', () => {
    const dialogSchemas = [dialogSchema];
    const triggers = [];
    const dialogs = [];
    const result = generateActivities(dialogSchemas, triggers, dialogs);
    expect(result).toEqual({});
  });

  it('should return an object containing activities', () => {
    const dialogSchemas = [dialogSchema];
    const triggers: any = [{ $kind: SDKKinds.OnTypingActivity }, { $kind: SDKKinds.OnHandoffActivity }];
    const dialogs: any = [{ id: 'test', content: { $designer: {} } }];
    const result = generateActivities(dialogSchemas, triggers, dialogs);
    expect(result).toEqual(
      expect.objectContaining({
        activities: {
          typing: {
            type: 'typing',
          },
          handoff: {
            type: 'handoff',
          },
          test: expect.objectContaining({
            name: 'test',
            type: 'event',
            value: expect.any(Object),
            resultValue: expect.any(Object),
          }),
        },
      })
    );
  });
});

describe('getDefinitions', () => {
  it('should return an empty object if there are no definitions', () => {
    const dialogSchemas = [];
    const selectedDialogs: any = [{ id: 'test' }];
    const result = getDefinitions(dialogSchemas, selectedDialogs);
    expect(result).toEqual({});
  });

  it('should return an object containing definitions', () => {
    const dialogSchemas = [dialogSchema];
    const selectedDialogs: any = [{ id: 'test' }];
    const result = getDefinitions(dialogSchemas, selectedDialogs);
    expect(result).toEqual(
      expect.objectContaining({
        definitions: {
          equalsExpression: expect.any(Object),
          integerExpression: expect.any(Object),
        },
      })
    );
  });
});

describe('generateDispatchModels', () => {
  it("should return empty object if there aren't any intents selected", () => {
    const schema = { properties: { dispatchModels: {} } };
    const dialogs: any = [{ id: 'test', content: { recognizer: 'test.lu' } }];
    const selectedTriggers = [];
    const luFiles = [];
    const result = generateDispatchModels(schema, dialogs, selectedTriggers, luFiles);
    expect(result).toEqual({});
  });

  it("should return empty object if the schema doesn't include dispatchModels", () => {
    const schema = { properties: {} };
    const dialogs: any = [{ id: 'test', content: { recognizer: 'test.lu' } }];
    const selectedTriggers = [{ $kind: SDKKinds.OnIntent, intent: 'testIntent' }];
    const luFiles: any = [{ id: 'test.en-us' }, { id: 'test.fr-FR' }];
    const result = generateDispatchModels(schema, dialogs, selectedTriggers, luFiles);
    expect(result).toEqual({});
  });

  it('should return empty object if the recognizer type is not luis', () => {
    const schema = { properties: {} };
    const dialogs: any = [{ id: 'test', content: {} }];
    const selectedTriggers = [{ $kind: SDKKinds.OnIntent, intent: 'testIntent' }];
    const luFiles: any = [{ id: 'test.en-us' }, { id: 'test.fr-FR' }];
    const result = generateDispatchModels(schema, dialogs, selectedTriggers, luFiles);
    expect(result).toEqual({});
  });

  it('should return dispatch models', () => {
    const schema = { properties: { dispatchModels: {} } };
    const dialogs: any = [{ id: 'test', content: { recognizer: 'test.lu' }, isRoot: true }];
    const selectedTriggers = [{ $kind: SDKKinds.OnIntent, intent: 'testIntent' }];
    const luFiles: any = [{ id: 'test.en-us' }, { id: 'test.fr-FR' }];
    const result = generateDispatchModels(schema, dialogs, selectedTriggers, luFiles);
    expect(result).toEqual(
      expect.objectContaining({
        dispatchModels: {
          languages: {
            'en-us': [
              {
                name: 'test',
                contentType: 'application/lu',
                url: `<test.en-us url>`,
                description: '<description>',
              },
            ],
            'fr-FR': [
              {
                name: 'test',
                contentType: 'application/lu',
                url: `<test.fr-FR url>`,
                description: '<description>',
              },
            ],
          },
          intents: ['testIntent'],
        },
      })
    );
  });
});
