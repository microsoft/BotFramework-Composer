// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { act } from '@bfc/test-utils/lib/hooks';

import { renderRecoilHook } from '../../../../__tests__/testUtils';
import { settingsState, currentProjectIdState, skillsState } from '../../atoms';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';
import { Dispatcher } from '..';
import { settingsDispatcher } from '../setting';
import httpClient from '../../../utils/httpUtil';

jest.mock('../../../utils/httpUtil');

const projectId = '1235a.2341';

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
  },
  downsampling: {
    maxImbalanceRatio: 10,
    maxUtteranceAllowed: 15000,
  },
  skill: {},
};

describe('setting dispatcher', () => {
  let renderedComponent, dispatcher: Dispatcher;
  beforeEach(() => {
    const useRecoilTestHook = () => {
      const settings = useRecoilValue(settingsState(projectId));
      const skills = useRecoilValue(skillsState(projectId));
      const currentDispatcher = useRecoilValue(dispatcherState);
      return {
        settings,
        skills,
        currentDispatcher,
      };
    };

    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [
        { recoilState: settingsState(projectId), initialValue: settings },
        { recoilState: currentProjectIdState, initialValue: projectId },
        { recoilState: skillsState(projectId), initialValue: [] },
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

    expect(renderedComponent.current.settings.publishTargets.length).toBe(1);
    expect(renderedComponent.current.settings.publishTargets[0].name).toBe('new');
  });

  it('should update RuntimeSettings', async () => {
    await act(async () => {
      await dispatcher.setRuntimeSettings(projectId, { path: 'path', command: 'command', key: 'key', name: 'name' });
    });

    expect(renderedComponent.current.settings.runtime.customRuntime).toBeTruthy();
    expect(renderedComponent.current.settings.runtime.path).toBe('path');
    expect(renderedComponent.current.settings.runtime.command).toBe('command');
    expect(renderedComponent.current.settings.runtime.key).toBe('key');
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

  it('should update skills state', async () => {
    (httpClient.get as jest.Mock).mockResolvedValue({
      data: { description: 'description', endpoints: [{ endpointUrl: 'https://test' }] },
    });

    await act(async () => {
      await dispatcher.setSettings(projectId, {
        skill: {
          foo: {
            msAppId: '00000000-0000',
            endpointUrl: 'https://skill-manifest/api/messages',
            name: 'foo',
            manifestUrl: 'https://skill-manifest',
          },
        },
      } as any);
    });

    expect(renderedComponent.current.skills).toEqual(
      expect.arrayContaining([
        {
          id: 'foo',
          name: 'foo',
          manifestUrl: 'https://skill-manifest',
          msAppId: '00000000-0000',
          endpointUrl: 'https://skill-manifest/api/messages',
          description: 'description',
          endpoints: expect.any(Array),
          content: expect.any(Object),
        },
      ])
    );
  });
});
