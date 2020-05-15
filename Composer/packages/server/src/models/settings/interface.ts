// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema7 } from '@bfc/plugin-loader';
export const OBFUSCATED_VALUE = '*****';

export interface ISettingManager {
  get(slot?: string, obfuscate?: boolean): Promise<any | null>;
  set(slot: string, settings: any): Promise<void>;
}

export const getDefaultSchema = (defaultValue): JSONSchema7 => {
  return {
    type: 'object',
    properties: {
      MicrosoftAppId: {
        type: 'string',
      },
      MicrosoftAppPassword: {
        type: 'string',
      },
      luis: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          authoringKey: {
            type: 'string',
          },
          endpointKey: {
            type: 'string',
          },
          authoringRegion: {
            type: 'string',
          },
          defaultLanguage: {
            type: 'string',
          },
          environment: {
            type: 'string',
          },
        },
      },
      feature: {
        type: 'object',
        properties: {
          UseShowTypingMiddleware: {
            type: 'boolean',
          },
          UseInspectionMiddleware: {
            type: 'boolean',
          },
        },
      },
      publishTargets: {
        type: 'array',
      },
      qna: {
        type: 'object',
        properties: {
          knowledgebaseid: {
            type: 'string',
          },
          endpointkey: {
            type: 'string',
          },
          hostname: {
            type: 'string',
          },
        },
      },
      telemetry: {
        type: 'object',
        properties: {
          logPersonalInformation: {
            type: 'boolean',
          },
          logActivities: {
            type: 'boolean',
          },
        },
      },
      runtime: {
        type: 'object',
        properties: {
          customRuntime: {
            type: 'boolean',
          },
          path: {
            type: 'string',
          },
          command: {
            type: 'string',
          },
        },
      },
      downsampling: {
        type: 'object',
        properties: {
          maxImbalanceRatio: {
            type: 'number',
          },
          maxUtteranceAllowed: {
            type: 'number',
          },
        },
      },
    },
    default: defaultValue,
  };
};
