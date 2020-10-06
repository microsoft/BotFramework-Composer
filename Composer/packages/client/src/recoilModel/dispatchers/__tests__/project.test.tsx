// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selector, useRecoilValue } from 'recoil';
import { v4 as uuid } from 'uuid';
import { act, RenderHookResult, HookResult } from '@bfc/test-utils/lib/hooks';
import { useRecoilState } from 'recoil';
import cloneDeep from 'lodash/cloneDeep';
import endsWith from 'lodash/endsWith';
import findIndex from 'lodash/findIndex';

import httpClient from '../../../utils/httpUtil';
import { projectDispatcher } from '../project';
import { botProjectFileDispatcher } from '../botProjectFile';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import {
  recentProjectsState,
  applicationErrorState,
  templateIdState,
  announcementState,
  boilerplateVersionState,
  templateProjectsState,
  runtimeTemplatesState,
  currentProjectIdState,
  skillManifestsState,
  luFilesState,
  lgFilesState,
  settingsState,
  dialogsState,
  botEnvironmentState,
  botDiagnosticsState,
  localeState,
  schemasState,
  locationState,
  skillsState,
  botStatusState,
  botDisplayNameState,
  botOpeningState,
  botProjectFileState,
  botProjectIdsState,
  botNameIdentifierState,
  botErrorState,
  botProjectSpaceLoadedState,
} from '../../atoms';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';
import { Dispatcher } from '../../dispatchers';
import { BotStatus } from '../../../constants';

import mockProjectData from './mocks/mockProjectResponse.json';
import mockManifestData from './mocks/mockManifest.json';
import mockBotProjectFileData from './mocks/mockBotProjectFile.json';

// let httpMocks;
let navigateTo;

const projectId = '30876.502871204648';

jest.mock('../../../utils/navigation', () => {
  const navigateMock = jest.fn();
  navigateTo = navigateMock;
  return {
    navigateTo: navigateMock,
  };
});

jest.mock('../../../utils/httpUtil');

jest.mock('../../parsers/lgWorker', () => {
  return {
    flush: () => new Promise((resolve) => resolve()),
    addProject: () => new Promise((resolve) => resolve()),
  };
});

jest.mock('../../parsers/luWorker', () => {
  return {
    flush: () => new Promise((resolve) => resolve()),
  };
});

jest.mock('../../persistence/FilePersistence', () => {
  return jest.fn().mockImplementation(() => {
    return { flush: () => new Promise((resolve) => resolve()) };
  });
});

describe('Project dispatcher', () => {
  let mockProjectResponse, mockManifestResponse, mockBotProjectResponse;
  const botStatesSelector = selector({
    key: 'botStatesSelector',
    get: ({ get }) => {
      const botProjectIds = get(botProjectIdsState);
      const botProjectData: { [projectName: string]: any } = {};
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
            projectId,
          };
        }
      });
      return botProjectData;
    },
  });

  const useRecoilTestHook = () => {
    const schemas = useRecoilValue(schemasState(projectId));
    const location = useRecoilValue(locationState(projectId));
    const skills = useRecoilValue(skillsState(projectId));
    const botName = useRecoilValue(botDisplayNameState(projectId));
    const skillManifests = useRecoilValue(skillManifestsState(projectId));
    const luFiles = useRecoilValue(luFilesState(projectId));
    const lgFiles = useRecoilValue(lgFilesState(projectId));
    const settings = useRecoilValue(settingsState(projectId));
    const dialogs = useRecoilValue(dialogsState(projectId));
    const botEnvironment = useRecoilValue(botEnvironmentState(projectId));
    const diagnostics = useRecoilValue(botDiagnosticsState(projectId));
    const locale = useRecoilValue(localeState(projectId));
    const botStatus = useRecoilValue(botStatusState(projectId));
    const botStates = useRecoilValue(botStatesSelector);
    const botProjectSpaceLoaded = useRecoilValue(botProjectSpaceLoadedState);

    const currentDispatcher = useRecoilValue(dispatcherState);
    const [recentProjects, setRecentProjects] = useRecoilState(recentProjectsState);
    const appError = useRecoilValue(applicationErrorState);
    const templateId = useRecoilValue(templateIdState);
    const announcement = useRecoilValue(announcementState);
    const boilerplateVersion = useRecoilValue(boilerplateVersionState);
    const templates = useRecoilValue(templateProjectsState);
    const runtimeTemplates = useRecoilValue(runtimeTemplatesState);
    const botOpening = useRecoilValue(botOpeningState);
    const [botProjectFile, setBotProjectFile] = useRecoilState(botProjectFileState(projectId));

    return {
      skillManifests,
      luFiles,
      lgFiles,
      settings,
      dialogs,
      botEnvironment,
      botName,
      botStatus,
      skills,
      location,
      schemas,
      diagnostics,
      projectId,
      locale,
      currentDispatcher,
      recentProjects,
      appError,
      templateId,
      announcement,
      boilerplateVersion,
      templates,
      runtimeTemplates,
      botOpening,
      botProjectFile,
      setBotProjectFile,
      setRecentProjects,
      botStates,
      botProjectSpaceLoaded,
    };
  };

  let renderedComponent: HookResult<ReturnType<typeof useRecoilTestHook>>, dispatcher: Dispatcher;

  beforeEach(async () => {
    navigateTo.mockReset();
    mockProjectResponse = cloneDeep(mockProjectData);
    mockManifestResponse = cloneDeep(mockManifestData);
    mockBotProjectResponse = cloneDeep(mockBotProjectFileData);
    const rendered: RenderHookResult<unknown, ReturnType<typeof useRecoilTestHook>> = renderRecoilHook(
      useRecoilTestHook,
      {
        states: [{ recoilState: currentProjectIdState, initialValue: projectId }],
        dispatcher: {
          recoilState: dispatcherState,
          initialValue: {
            projectDispatcher,
            botProjectFileDispatcher,
          },
        },
      }
    );
    renderedComponent = rendered.result;
    dispatcher = renderedComponent.current.currentDispatcher;
  });

  it('should throw an error if no bot project file is present in the bot', async () => {
    const cloned = cloneDeep(mockProjectResponse);
    const filtered = cloned.files.filter((file) => !endsWith(file.name, '.botproj'));
    cloned.files = filtered;
    (httpClient.put as jest.Mock).mockResolvedValueOnce({
      data: cloned,
    });
    await act(async () => {
      await dispatcher.openProject('../test/empty-bot', 'default');
    });
    expect(navigateTo).toHaveBeenLastCalledWith(`/home`);
  });

  it('should open bot project', async () => {
    (httpClient.put as jest.Mock).mockResolvedValueOnce({
      data: mockProjectResponse,
    });
    await act(async () => {
      await dispatcher.openProject('../test/empty-bot', 'default');
    });

    expect(renderedComponent.current.projectId).toBe(mockProjectResponse.id);
    expect(renderedComponent.current.botName).toBe(mockProjectResponse.botName);
    expect(renderedComponent.current.settings).toStrictEqual(mockProjectResponse.settings);
    expect(renderedComponent.current.lgFiles.length).toBe(1);
    expect(renderedComponent.current.luFiles.length).toBe(1);
    expect(renderedComponent.current.botEnvironment).toBe(mockProjectResponse.botEnvironment);
    expect(renderedComponent.current.skills.length).toBe(0);
    expect(renderedComponent.current.botOpening).toBeFalsy();
    expect(renderedComponent.current.schemas.sdk).toBeDefined();
    expect(renderedComponent.current.schemas.default).toBeDefined();
    expect(renderedComponent.current.schemas.diagnostics?.length).toBe(0);
    expect(navigateTo).toHaveBeenLastCalledWith(`/bot/${projectId}/dialogs/emptybot-1`);
  });

  it('should handle project failure if project does not exist', async () => {
    const errorObj = {
      data: 'Project does not exist in cache',
    };
    (httpClient.put as jest.Mock).mockRejectedValueOnce(errorObj);

    await act(async () => {
      renderedComponent.current.setRecentProjects([
        {
          path: '../test/empty-bot',
        },
      ]);
      await dispatcher.openProject('../test/empty-bot', 'default');
    });
    expect(renderedComponent.current.botOpening).toBeFalsy();
    expect(renderedComponent.current.appError).toEqual(errorObj);
    expect(renderedComponent.current.recentProjects.length).toBe(0);
    expect(navigateTo).toHaveBeenLastCalledWith(`/home`);
  });

  it('should fetch recent projects', async () => {
    const recentProjects = [{ path: '../test/empty-bot1' }, { path: '../test/empty-bot2' }];
    (httpClient.get as jest.Mock).mockResolvedValue({ data: recentProjects });
    await act(async () => {
      await dispatcher.fetchRecentProjects();
    });

    expect(renderedComponent.current.recentProjects).toEqual(recentProjects);
  });

  it('should delete a project', async () => {
    (httpClient.delete as jest.Mock).mockResolvedValue({ data: {} });
    (httpClient.put as jest.Mock).mockResolvedValueOnce({
      data: mockProjectResponse,
    });
    await act(async () => {
      await dispatcher.openProject('../test/empty-bot', 'default');
      await dispatcher.deleteBot(projectId);
    });

    expect(renderedComponent.current.botName).toEqual('');
    expect(renderedComponent.current.locale).toBe('en-us');
    expect(renderedComponent.current.lgFiles.length).toBe(0);
    expect(renderedComponent.current.luFiles.length).toBe(0);
    expect(renderedComponent.current.botEnvironment).toBe('production');
    expect(renderedComponent.current.skills.length).toBe(0);
    expect(renderedComponent.current.botOpening).toBeFalsy();
    expect(renderedComponent.current.schemas.sdk).toBeUndefined();
    expect(renderedComponent.current.schemas.default).toBeUndefined();
    expect(renderedComponent.current.schemas.diagnostics?.length).toBeUndefined();
  });

  it('should set bot status', async () => {
    await act(async () => {
      await dispatcher.setBotStatus(BotStatus.pending, projectId);
    });

    expect(renderedComponent.current.botStatus).toEqual(BotStatus.pending);
  });

  it('should save template id', async () => {
    act(() => {
      dispatcher.saveTemplateId('EchoBot');
    });

    expect(renderedComponent.current.templateId).toEqual('EchoBot');
  });

  it('should update boilerplate', async () => {
    httpClient.get as jest.Mock;
    await act(async () => {
      await dispatcher.updateBoilerplate(projectId);
    });

    expect(renderedComponent.current.announcement).toEqual('Scripts successfully updated.');
  });

  it('should get boilerplate version', async () => {
    const version = { updateRequired: true, latestVersion: '3', currentVersion: '2' };
    (httpClient.get as jest.Mock).mockResolvedValue({
      data: version,
    });
    await act(async () => {
      await dispatcher.getBoilerplateVersion(projectId);
    });

    expect(renderedComponent.current.boilerplateVersion).toEqual(version);
  });

  it('should be able to add an existing skill to Botproject', async () => {
    (httpClient.get as jest.Mock).mockResolvedValueOnce({
      data: {},
    });
    const skills = [
      { botName: 'Echo-Skill-1', id: '40876.502871204648', location: '/Users/tester/Desktop/Echo-Skill-1' },
      { botName: 'Echo-Skill-2', id: '50876.502871204648', location: '/Users/tester/Desktop/Echo-Skill-2' },
    ];
    const mappedSkills = skills.map(({ botName, id, location }) => {
      const cloned = cloneDeep(mockProjectResponse);
      return {
        ...cloned,
        botName,
        id,
        location,
      };
    });

    await act(async () => {
      (httpClient.put as jest.Mock).mockResolvedValueOnce({
        data: mockProjectResponse,
      });
      await dispatcher.openProject('../test/empty-bot', 'default');
    });

    await act(async () => {
      (httpClient.put as jest.Mock).mockResolvedValueOnce({
        data: mappedSkills[0],
      });
      await dispatcher.addExistingSkillToBotProject(mappedSkills[0].location, 'default');
    });

    expect(renderedComponent.current.botStates.echoSkill1).toBeDefined();
    expect(renderedComponent.current.botStates.echoSkill1.botDisplayName).toBe('Echo-Skill-1');

    await act(async () => {
      (httpClient.put as jest.Mock).mockResolvedValueOnce({
        data: mappedSkills[1],
      });
      await dispatcher.addExistingSkillToBotProject(mappedSkills[1].location, 'default');
    });

    expect(renderedComponent.current.botStates.echoSkill2).toBeDefined();
    expect(renderedComponent.current.botStates.echoSkill2.botDisplayName).toBe('Echo-Skill-2');

    await act(async () => {
      await dispatcher.addRemoteSkillToBotProject('https://test.net/api/manifest/man', 'test-skill', 'remote');
    });

    expect(navigateTo).toHaveBeenLastCalledWith(`/bot/${projectId}/dialogs/emptybot-1`);
  });

  it('should be able to add a remote skill to Botproject', async () => {
    const mockImplementation = (httpClient.get as jest.Mock).mockImplementation((url: string) => {
      if (endsWith(url, '/projects/generateProjectId')) {
        return {
          data: '1234.1123213',
        };
      } else {
        return {
          data: mockManifestResponse,
        };
      }
    });

    await act(async () => {
      (httpClient.put as jest.Mock).mockResolvedValueOnce({
        data: mockProjectResponse,
      });
      await dispatcher.openProject('../test/empty-bot', 'default');
    });

    await act(async () => {
      await dispatcher.addRemoteSkillToBotProject(
        'https://test-dev.azurewebsites.net/manifests/onenote-2-1-preview-1-manifest.json',
        'one-note',
        'remote'
      );
    });

    expect(renderedComponent.current.botStates.oneNote).toBeDefined();
    expect(renderedComponent.current.botStates.oneNote.botDisplayName).toBe('OneNoteSync');
    expect(renderedComponent.current.botStates.oneNote.location).toBe(
      'https://test-dev.azurewebsites.net/manifests/onenote-2-1-preview-1-manifest.json'
    );
    expect(navigateTo).toHaveBeenLastCalledWith(`/bot/${projectId}/dialogs/emptybot-1`);
    mockImplementation.mockClear();
  });

  it('should remove a skill from bot project', async () => {
    const mockImplementation = (httpClient.get as jest.Mock).mockImplementation((url: string) => {
      if (endsWith(url, '/projects/generateProjectId')) {
        return {
          data: uuid(),
        };
      } else {
        return {
          data: mockManifestResponse,
        };
      }
    });

    await act(async () => {
      (httpClient.put as jest.Mock).mockResolvedValueOnce({
        data: mockProjectResponse,
      });
      await dispatcher.openProject('../test/empty-bot', 'default');
    });

    await act(async () => {
      await dispatcher.addRemoteSkillToBotProject(
        'https://test-dev.azurewebsites.net/manifests/onenote-2-1-preview-1-manifest.json',
        'one-note',
        'remote'
      );
    });

    await act(async () => {
      await dispatcher.addRemoteSkillToBotProject(
        'https://test-dev.azurewebsites.net/manifests/onenote-second-manifest.json',
        'one-note-2',
        'remote'
      );
    });

    const oneNoteProjectId = renderedComponent.current.botStates.oneNote.projectId;
    mockImplementation.mockClear();

    await act(async () => {
      dispatcher.removeSkillFromBotProject(oneNoteProjectId);
    });
    expect(renderedComponent.current.botStates.oneNote).toBeUndefined();
  });

  it('should be able to add a new skill to Botproject', async () => {
    await act(async () => {
      (httpClient.put as jest.Mock).mockResolvedValueOnce({
        data: mockProjectResponse,
      });
      await dispatcher.openProject('../test/empty-bot', 'default');
    });

    const newProjectDataClone = cloneDeep(mockProjectResponse);
    newProjectDataClone.botName = 'new-bot';
    await act(async () => {
      (httpClient.post as jest.Mock).mockResolvedValueOnce({
        data: newProjectDataClone,
      });
      await dispatcher.addNewSkillToBotProject({
        name: 'new-bot',
        description: '',
        schemaUrl: '',
        location: '/Users/tester/Desktop/samples',
        templateId: 'InterruptionSample',
        locale: 'us-en',
        qnaKbUrls: [],
      });
    });

    expect(renderedComponent.current.botStates.newBot).toBeDefined();
    expect(renderedComponent.current.botStates.newBot.botDisplayName).toBe('new-bot');
    expect(navigateTo).toHaveBeenLastCalledWith(`/bot/${projectId}/dialogs/emptybot-1`);
  });

  it('should be able to open a project and its skills in Bot project file', async (done) => {
    let callIndex = 0;
    (httpClient.put as jest.Mock).mockImplementation(() => {
      let mockSkillData: any;
      callIndex++;
      switch (callIndex) {
        case 1:
          return Promise.resolve({ data: mockProjectResponse });
        case 2: {
          mockSkillData = cloneDeep(mockProjectResponse);
          mockSkillData.botName = 'todo-skill';
          mockSkillData.id = '20876.502871204648';
          return Promise.resolve({ data: mockSkillData });
        }
        case 3: {
          mockSkillData = cloneDeep(mockProjectResponse);
          mockSkillData.botName = 'google-keep-sync';
          mockSkillData.id = '50876.502871204648';
          return Promise.resolve({ data: mockSkillData });
        }
      }
    });
    const matchIndex = findIndex(mockProjectResponse.files, (file: any) => endsWith(file.name, '.botproj'));
    mockProjectResponse.files[matchIndex] = {
      ...mockProjectResponse.files[matchIndex],
      content: JSON.stringify(mockBotProjectResponse),
    };
    expect(renderedComponent.current.botProjectSpaceLoaded).toBeFalsy();

    await act(async () => {
      await dispatcher.openProject('../test/empty-bot', 'default');
    });
    setImmediate(() => {
      expect(renderedComponent.current.botStates.todoSkill.botDisplayName).toBe('todo-skill');
      expect(renderedComponent.current.botStates.googleKeepSync.botDisplayName).toBe('google-keep-sync');
      expect(renderedComponent.current.botProjectSpaceLoaded).toBeTruthy();
      done();
    });
  });
});
