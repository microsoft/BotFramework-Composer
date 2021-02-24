// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selector, useRecoilValue, selectorFamily, useRecoilState } from 'recoil';
import { act, RenderHookResult, HookResult } from '@botframework-composer/test-utils/lib/hooks';
import noop from 'lodash/noop';
import { BotProjectFile, Skill } from '@bfc/shared';

import { botProjectFileDispatcher } from '../botProjectFile';
import { settingsDispatcher } from '../setting';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import {
  botDisplayNameState,
  botErrorState,
  botNameIdentifierState,
  botProjectFileState,
  botProjectIdsState,
  currentProjectIdState,
  dispatcherState,
  locationState,
  projectMetaDataState,
  settingsState,
} from '../../atoms';
import { Dispatcher } from '..';

jest.mock('../../../utils/httpUtil');
const rootBotProjectId = '2345.32324';
const testSkillId = '123.1sd23';

describe('Bot Project File dispatcher', () => {
  const skillsDataSelector = selectorFamily({
    key: 'skillsDataSelector-botProjectFile',
    get: (skillId: string) => noop,
    set: (skillId: string) => ({ set }, stateUpdater: any) => {
      const { botNameIdentifier, location } = stateUpdater;
      set(botNameIdentifierState(skillId), botNameIdentifier);
      set(locationState(skillId), location);
    },
  });

  const botStatesSelector = selector({
    key: 'botStatesSelector',
    get: ({ get }) => {
      const botProjectIds = get(botProjectIdsState);
      const botProjectData: { [projectName: string]: { botDisplayName: string; botError: any; location: string } } = {};
      botProjectIds.map((projectId) => {
        const botDisplayName = get(botDisplayNameState(projectId));
        const botNameIdentifier = get(botNameIdentifierState(projectId));
        const botError = get(botErrorState(projectId));
        const location = get(locationState(projectId));
        if (botNameIdentifier) {
          botProjectData[botNameIdentifier] = {
            botDisplayName,
            location,
            botError,
          };
        }
      });
      return botProjectData;
    },
  });

  const useRecoilTestHook = () => {
    const botName = useRecoilValue(botDisplayNameState(rootBotProjectId));
    const [botProjectFile, setBotProjectFile] = useRecoilState(botProjectFileState(rootBotProjectId));
    const currentDispatcher = useRecoilValue(dispatcherState);
    const botStates = useRecoilValue(botStatesSelector);
    const [skillsData, setSkillsData] = useRecoilState(skillsDataSelector(testSkillId));
    const [settings, setSettings] = useRecoilState(settingsState(rootBotProjectId));

    return {
      botName,
      currentDispatcher,
      botProjectFile,
      botStates,
      skillsData,
      setSkillsData,
      settings,
      setters: {
        setBotProjectFile,
        setSettings,
      },
    };
  };

  let renderedComponent: HookResult<ReturnType<typeof useRecoilTestHook>>, dispatcher: Dispatcher;
  beforeEach(() => {
    const rendered: RenderHookResult<unknown, ReturnType<typeof useRecoilTestHook>> = renderRecoilHook(
      useRecoilTestHook,
      {
        states: [
          { recoilState: currentProjectIdState, initialValue: rootBotProjectId },
          {
            recoilState: botProjectFileState(rootBotProjectId),
            initialValue: {
              content: {
                $schema: '',
                name: 'TesterBot',
                skills: {},
              },
            },
          },
          {
            recoilState: projectMetaDataState(rootBotProjectId),
            initialValue: {
              isRootBot: true,
            },
          },
          { recoilState: botProjectIdsState, initialValue: [rootBotProjectId] },
          {
            recoilState: locationState(rootBotProjectId),
            initialValue: '/Users/tester/Desktop/LoadedBotProject/RootBot',
          },
        ],
        dispatcher: {
          recoilState: dispatcherState,
          initialValue: {
            botProjectFileDispatcher,
            settingsDispatcher,
          },
        },
      }
    );
    renderedComponent = rendered.result;
    dispatcher = renderedComponent.current.currentDispatcher;
  });

  it('should add a local skill to bot project file', async () => {
    await act(async () => {
      renderedComponent.current.setSkillsData({
        location: '/Users/tester/Desktop/LoadedBotProject/Todo-Skill',
        botNameIdentifier: 'todoSkill',
      });
    });

    await act(async () => {
      dispatcher.addLocalSkillToBotProjectFile(testSkillId);
    });

    expect(renderedComponent.current.botProjectFile.content.skills.todoSkill.workspace).toMatch(
      /\.\.(\/|\\)Todo-Skill/
    );
    expect(renderedComponent.current.botProjectFile.content.skills.todoSkill.remote).toBeFalsy();
  });

  it('should add a remote skill to bot project file', async () => {
    const manifestUrl = 'https://test-dev.azurewebsites.net/manifests/test-2-1-preview-1-manifest.json';
    await act(async () => {
      renderedComponent.current.setSkillsData({
        location: manifestUrl,
        botNameIdentifier: 'oneNoteSkill',
      });
    });

    await act(async () => {
      dispatcher.addRemoteSkillToBotProjectFile(testSkillId, manifestUrl, 'remote');
    });

    expect(renderedComponent.current.botProjectFile.content.skills.oneNoteSkill.manifest).toBe(manifestUrl);
    expect(renderedComponent.current.botProjectFile.content.skills.oneNoteSkill.workspace).toBeUndefined();
    expect(renderedComponent.current.botProjectFile.content.skills.oneNoteSkill.endpointName).toBe('remote');
  });

  it('should remove a skill from the bot project file', async () => {
    const manifestUrl = 'https://test-dev.azurewebsites.net/manifests/test-2-1-preview-1-manifest.json';
    await act(async () => {
      renderedComponent.current.setSkillsData({
        location: manifestUrl,
        botNameIdentifier: 'oneNoteSkill',
      });
    });

    await act(async () => {
      dispatcher.addRemoteSkillToBotProjectFile(testSkillId, manifestUrl, 'remote');
    });
    expect(renderedComponent.current.botProjectFile.content.skills.oneNoteSkill.manifest).toBe(manifestUrl);

    await act(async () => {
      renderedComponent.current.setters.setSettings({
        ...renderedComponent.current.settings,
        skill: {
          oneNoteSkill: {
            endpointUrl: 'https://test/api/messages',
            msAppId: '1234-2312-23432-32432',
          },
        },
      });
    });
    expect(renderedComponent.current.settings.skill?.oneNoteSkill).toBeDefined();

    await act(async () => {
      dispatcher.removeSkillFromBotProjectFile(testSkillId);
    });
    expect(renderedComponent.current.botProjectFile.content.skills.oneNoteSkill).toBeUndefined();
    expect(renderedComponent.current.settings.skill?.oneNoteSkill).toBeUndefined();
  });

  it('should update endpoint name of skill in Botproject file', async () => {
    const mockFile: BotProjectFile = {
      id: '',
      content: {
        name: 'TesterBot',
        skills: {
          googleSkill: {
            workspace: '../googleSkill',
            remote: false,
            endpointName: 'default',
          },
        },
      },
      lastModified: '',
    };
    await act(async () => {
      renderedComponent.current.setters.setBotProjectFile(mockFile);
    });

    await act(async () => {
      dispatcher.updateEndpointNameInBotProjectFile('googleSkill', 'remote');
    });

    expect(renderedComponent.current.botProjectFile.content.skills.googleSkill.endpointName).toBe('remote');
  });

  it('should delete endpoint in BotProject file if Local Composer endpoint is chosen', async () => {
    const googleKeepSkill: Skill = {
      id: '12a-asd',
      manifest: undefined,
      name: 'googleSkill',
      remote: false,
    };

    const mockFile: BotProjectFile = {
      id: '',
      content: {
        name: 'TesterBot',
        skills: {
          googleSkill: {
            workspace: '../googleSkill',
            remote: false,
            endpointName: 'default',
          },
        },
      },
      lastModified: '',
    };

    await act(async () => {
      renderedComponent.current.setters.setSettings({
        ...renderedComponent.current.settings,
        skill: {
          googleSkill: {
            endpointUrl: 'https://test/api/messages',
            msAppId: '1234-2312-23432-32432',
          },
        },
      });
    });

    await act(async () => {
      renderedComponent.current.setters.setBotProjectFile(mockFile);
    });

    await act(async () => {
      await dispatcher.updateSkillsDataInBotProjectFile('googleSkill', googleKeepSkill, -1);
    });

    expect(renderedComponent.current.botProjectFile.content.skills.googleSkill.endpointName).toBeUndefined();

    expect(renderedComponent.current.settings.skill).toEqual({
      googleSkill: {
        endpointUrl: '',
        msAppId: '',
      },
    });
  });

  it('should update manifest in BotProject file', async () => {
    await act(async () => {
      renderedComponent.current.setSkillsData({
        location: '/Users/tester/Desktop/LoadedBotProject/Google-Skill',
        botNameIdentifier: 'googleSkill',
      });
    });

    const mockFile: BotProjectFile = {
      id: '',
      content: {
        name: 'TesterBot',
        skills: {
          googleSkill: {
            workspace: '../googleSkill',
            remote: false,
            endpointName: 'default',
          },
        },
      },
      lastModified: '',
    };
    await act(async () => {
      renderedComponent.current.setters.setBotProjectFile(mockFile);
    });

    await act(async () => {
      await dispatcher.updateManifestInBotProjectFile(testSkillId, 'googleKeepManifest');
    });
    expect(renderedComponent.current.botProjectFile.content.skills.googleSkill.manifest).toBe('googleKeepManifest');
  });

  it('should update endpoint in BotProject file', async () => {
    await act(async () => {
      renderedComponent.current.setters.setSettings({
        ...renderedComponent.current.settings,
        skill: {},
      });
    });
    const googleKeepSkill: Skill = {
      id: '12a.asd',
      manifest: {
        name: 'google-keep-manifest',
        version: '1.0',
        description: 'Manifest',
        endpoints: [
          {
            name: 'local',
            endpointUrl: 'http://localhost:3978/api/messages',
            msAppId: '1232-1233-1234-1231',
            description: 'Local endpoint skill',
          },
          {
            name: 'remote',
            endpointUrl: 'http://azure.websites/api/messages',
            msAppId: '6734-1233-1234-1231',
            description: 'Remote endpoint skill',
          },
        ],
      },
      name: 'googleSkill',
      remote: false,
    };

    await act(async () => {
      renderedComponent.current.setSkillsData({
        location: '/Users/tester/Desktop/LoadedBotProject/Todo-Skill',
        botNameIdentifier: 'todoSkill',
      });
    });

    const mockFile: BotProjectFile = {
      id: '',
      content: {
        name: 'TesterBot',
        skills: {
          googleSkill: {
            workspace: '../googleSkill',
            remote: false,
            endpointName: 'default',
          },
        },
      },
      lastModified: '',
    };
    await act(async () => {
      renderedComponent.current.setters.setBotProjectFile(mockFile);
    });

    await act(async () => {
      await dispatcher.updateSkillsDataInBotProjectFile('googleSkill', googleKeepSkill, 1);
    });
    expect(renderedComponent.current.botProjectFile.content.skills.googleSkill.endpointName).toBe('remote');
    expect(renderedComponent.current.settings.skill).toEqual({
      googleSkill: {
        endpointUrl: 'http://azure.websites/api/messages',
        msAppId: '6734-1233-1234-1231',
      },
    });
  });
});
