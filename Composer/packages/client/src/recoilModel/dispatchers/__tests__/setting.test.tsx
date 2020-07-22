// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { act } from '@bfc/test-utils/lib/hooks';

import { renderRecoilHook } from '../../../../__tests__/testUtils';
import { settingsState } from '../../atoms';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';
import { Dispatcher } from '..';
import { settingsDispatcher } from '../setting';

const settings = {
  feature: {
    UseShowTypingMiddleware: false,
    UseInspectionMiddleware: false,
    RemoveRecipientMention: false,
  },
  MicrosoftAppPassword: '',
  MicrosoftAppId: '',
  cosmosDb: {
    authKey: '',
    collectionId: 'botstate-collection',
    cosmosDBEndpoint: '',
    databaseId: 'botstate-db',
  },
  applicationInsights: {
    InstrumentationKey: '',
  },
  blobStorage: {
    connectionString: '',
    container: 'transcripts',
  },
  defaultLanguage: 'en-us',
  languages: ['en-us'],
  luis: {
    name: '',
    authoringKey: '',
    authoringEndpoint: '',
    endpointKey: '',
    endpoint: '',
    authoringRegion: 'westus',
    defaultLanguage: 'en-us',
    environment: 'composer',
  },
  publishTargets: [],
  qna: {
    knowledgebaseid: '',
    endpointkey: '',
    hostname: '',
  },
  telemetry: {
    logPersonalInformation: false,
    logActivities: true,
  },
  runtime: {
    customRuntime: false,
    path: '',
    command: '',
  },
  downsampling: {
    maxImbalanceRatio: 10,
    maxUtteranceAllowed: 15000,
  },
};

describe('setting dispatcher', () => {
  let renderedComponent, dispatcher: Dispatcher;
  beforeEach(() => {
    const useRecoilTestHook = () => {
      const settings = useRecoilValue(settingsState);
      const currentDispatcher = useRecoilValue(dispatcherState);

      return {
        settings,
        currentDispatcher,
      };
    };

    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [{ recoilState: settingsState, initialValue: settings }],
      dispatcher: {
        recoilState: dispatcherState,
        initialValue: {
          settingsDispatcher,
        },
      },
    });
    renderedComponent = result;
    dispatcher = renderedComponent.current.currentDispatcher;
  });

  it('should update all settings', async () => {
    await act(async () => {
      await dispatcher.setSettings('test', {
        ...settings,
        MicrosoftAppPassword: 'test',
        luis: { ...settings.luis, authoringKey: 'test', endpointKey: 'test' },
      });
    });

    expect(renderedComponent.current.settings.MicrosoftAppPassword).toBe('test');
  });

  it('should update PublishTargets', async () => {
    await act(async () => {
      await dispatcher.setPublishTargets([
        {
          name: 'new',
          type: 'type',
          configuration: '',
          lastPublished: new Date(),
        },
      ]);
    });

    expect(renderedComponent.current.settings.publishTargets.length).toBe(1);
    expect(renderedComponent.current.settings.publishTargets[0].name).toBe('new');
  });

  it('should update RuntimeSettings', async () => {
    await act(async () => {
      await dispatcher.setRuntimeSettings('', 'path', 'command');
    });

    expect(renderedComponent.current.settings.runtime.customRuntime).toBeTruthy();
    expect(renderedComponent.current.settings.runtime.path).toBe('path');
    expect(renderedComponent.current.settings.runtime.command).toBe('command');
  });

  it('should update customRuntime', async () => {
    await act(async () => {
      await dispatcher.setCustomRuntime('', false);
    });
    expect(renderedComponent.current.settings.runtime.customRuntime).toBeFalsy();

    await act(async () => {
      await dispatcher.setCustomRuntime('', true);
    });
    expect(renderedComponent.current.settings.runtime.customRuntime).toBeTruthy();
  });
});
