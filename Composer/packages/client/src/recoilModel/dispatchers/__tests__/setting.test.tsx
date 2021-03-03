// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { act, HookResult } from '@botframework-composer/test-utils/lib/hooks';

import { renderRecoilHook } from '../../../../__tests__/testUtils';
import { settingsState, currentProjectIdState, dispatcherState } from '../../atoms';
import { Dispatcher } from '..';
import { settingsDispatcher } from '../setting';

jest.mock('../../../utils/httpUtil');

const projectId = '1235a.2341';

const settings = {
  feature: {
    UseShowTypingMiddleware: false,
    UseInspectionMiddleware: false,
    RemoveRecipientMention: false,
    UseSetSpeakMiddleware: false,
  },
  MicrosoftAppPassword: '',
  MicrosoftAppId: '',
  cosmosDb: {
    authKey: '',
    containerId: 'botstate-container',
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
  speech: {
    voiceFontName: 'en-US-AriaNeural',
    fallbackToTextForSpeechIfEmpty: true,
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
  importedLibraries: [],
  qna: {
    knowledgebaseid: '',
    endpointKey: '',
    hostname: '',
    qnaRegion: 'westus',
  },
  telemetry: {
    logPersonalInformation: false,
    logActivities: true,
  },
  runtime: {
    customRuntime: false,
    path: '',
    command: '',
    key: '',
    name: '',
  },
  downsampling: {
    maxImbalanceRatio: 10,
  },
  skill: {},
  customFunctions: [],
};

describe('setting dispatcher', () => {
  const useRecoilTestHook = () => {
    const settings = useRecoilValue(settingsState(projectId));
    const currentDispatcher = useRecoilValue(dispatcherState);
    return {
      settings,
      currentDispatcher,
    };
  };

  let renderedComponent: HookResult<ReturnType<typeof useRecoilTestHook>>, dispatcher: Dispatcher;

  beforeEach(() => {
    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [
        { recoilState: settingsState(projectId), initialValue: settings },
        { recoilState: currentProjectIdState, initialValue: projectId },
      ],
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
      await dispatcher.setSettings(projectId, {
        ...settings,
        MicrosoftAppPassword: 'test',
        luis: { ...settings.luis, authoringKey: 'test', endpointKey: 'test' },
        qna: { ...settings.qna, subscriptionKey: 'test', endpointKey: 'test' },
        luFeatures: {},
      });
    });

    expect(renderedComponent.current.settings.MicrosoftAppPassword).toBe('test');
  });

  it('should update PublishTargets', async () => {
    await act(async () => {
      await dispatcher.setPublishTargets(
        [
          {
            name: 'new',
            type: 'type',
            configuration: '',
            lastPublished: new Date(),
          },
        ],
        projectId
      );
    });

    expect(renderedComponent.current.settings.publishTargets?.length).toBe(1);
    expect(renderedComponent.current.settings.publishTargets?.[0].name).toBe('new');
  });

  it('should update RuntimeSettings', async () => {
    await act(async () => {
      await dispatcher.setRuntimeSettings(projectId, { path: 'path', command: 'command', key: 'key', name: 'name' });
    });

    expect(renderedComponent.current.settings.runtime.customRuntime).toBeTruthy();
    expect(renderedComponent.current.settings.runtime.path).toBe('path');
    expect(renderedComponent.current.settings.runtime.command).toBe('command');
    expect(renderedComponent.current.settings.runtime.key).toBe('key');
    // @ts-ignore - runtime has 'name' in practice and is of a type that has 'name', but TS isn't seeing it somehow
    expect(renderedComponent.current.settings.runtime.name).toBe('name');
  });

  it('should update customRuntime', async () => {
    await act(async () => {
      await dispatcher.setCustomRuntime(projectId, false);
    });
    expect(renderedComponent.current.settings.runtime.customRuntime).toBeFalsy();

    await act(async () => {
      await dispatcher.setCustomRuntime(projectId, true);
    });
    expect(renderedComponent.current.settings.runtime.customRuntime).toBeTruthy();
  });
});
