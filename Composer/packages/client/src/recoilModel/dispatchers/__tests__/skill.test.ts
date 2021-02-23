// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selectorFamily, useRecoilState, useRecoilValue } from 'recoil';
import { act, HookResult } from '@botframework-composer/test-utils/lib/hooks';

import { skillDispatcher } from '../skill';
import { botProjectFileDispatcher } from '../botProjectFile';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import {
  skillManifestsState,
  onAddSkillDialogCompleteState,
  settingsState,
  showAddSkillDialogModalState,
  botProjectFileState,
  botNameIdentifierState,
  locationState,
  projectMetaDataState,
  botDisplayNameState,
  dispatcherState,
} from '../../atoms';
import { botEndpointsState, botProjectIdsState, currentProjectIdState, displaySkillManifestState } from '../../atoms';
import { Dispatcher } from '..';
import { skillsStateSelector } from '../../selectors';

import mockBotProjectFileData from './mocks/mockBotProjectFile.json';

jest.mock('../../../utils/httpUtil', () => {
  return {
    __esModule: true,
    default: {
      post: (url, skillObject) => ({
        url,
        data: skillObject.skills,
      }),
    },
  };
});

const mockDialogComplete = jest.fn();
const projectId = '42345.23432';
const skillIds = ['1234.123', '234.234'];

describe('skill dispatcher', () => {
  const skillsDataSelector = selectorFamily({
    key: 'skillSelector-skill',
    get: (skillId: string) => ({ get }) => {
      return {
        skillNameIdentifier: get(botNameIdentifierState(skillId)),
        location: get(locationState(skillId)),
      };
    },
    set: (skillId: string) => ({ set }, stateUpdater: any) => {
      const { botNameIdentifier, location, displayName, settings } = stateUpdater;
      set(botNameIdentifierState(skillId), botNameIdentifier);
      set(locationState(skillId), location);
      set(settingsState(skillId), settings);
      set(botDisplayNameState(skillId), displayName);
    },
  });

  const useRecoilTestHook = () => {
    const projectId = useRecoilValue(currentProjectIdState);
    const skillManifests = useRecoilValue(skillManifestsState(projectId));
    const onAddSkillDialogComplete = useRecoilValue(onAddSkillDialogCompleteState(projectId));
    const settings = useRecoilValue(settingsState(projectId));
    const showAddSkillDialogModal = useRecoilValue(showAddSkillDialogModalState);
    const displaySkillManifest = useRecoilValue(displaySkillManifestState);
    const skills = useRecoilValue(skillsStateSelector);
    const [botEndpoints, setBotEndpoints] = useRecoilState(botEndpointsState);
    const currentDispatcher = useRecoilValue(dispatcherState);

    const [todoSkillData, setTodoSkillData] = useRecoilState(skillsDataSelector(skillIds[0]));
    const [googleKeepData, setGoogleKeepData] = useRecoilState(skillsDataSelector(skillIds[1]));

    return {
      projectId,
      skillManifests,
      onAddSkillDialogComplete,
      settings,
      showAddSkillDialogModal,
      displaySkillManifest,
      currentDispatcher,
      skills,
      botEndpoints,
      todoSkillData,
      googleKeepData,
      setters: {
        setBotEndpoints,
        setTodoSkillData,
        setGoogleKeepData,
      },
    };
  };

  let renderedComponent: HookResult<ReturnType<typeof useRecoilTestHook>>, dispatcher: Dispatcher;

  beforeEach(() => {
    mockDialogComplete.mockClear();

    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [
        {
          recoilState: skillManifestsState(projectId),
          initialValue: [
            { id: 'id1', content: 'content1' },
            { id: 'id2', content: 'content2' },
          ],
        },
        { recoilState: onAddSkillDialogCompleteState(projectId), initialValue: { func: undefined } },
        { recoilState: settingsState(projectId), initialValue: {} },
        { recoilState: showAddSkillDialogModalState, initialValue: false },
        { recoilState: displaySkillManifestState, initialValue: undefined },
        { recoilState: currentProjectIdState, initialValue: projectId },
        { recoilState: botProjectIdsState, initialValue: [projectId, ...skillIds] },
        { recoilState: settingsState(projectId), initialValue: {} },
        {
          recoilState: botProjectFileState(projectId),
          initialValue: {
            content: mockBotProjectFileData,
          },
        },
        {
          recoilState: projectMetaDataState(projectId),
          initialValue: {
            isRootBot: true,
          },
        },
      ],
      dispatcher: {
        recoilState: dispatcherState,
        initialValue: {
          skillDispatcher,
          botProjectFileDispatcher,
        },
      },
    });

    renderedComponent = result;
    dispatcher = renderedComponent.current.currentDispatcher;
  });

  it('createSkillManifest', async () => {
    await act(async () => {
      dispatcher.updateSkillManifest({ id: 'id3', content: 'content3' }, projectId);
    });
    expect(renderedComponent.current.skillManifests).toEqual([
      { id: 'id1', content: 'content1' },
      { id: 'id2', content: 'content2' },
      { id: 'id3', content: 'content3' },
    ]);
  });

  it('removeSkillManifest', async () => {
    await act(async () => {
      dispatcher.removeSkillManifest('id1', projectId);
    });
    expect(renderedComponent.current.skillManifests).toEqual([{ id: 'id2', content: 'content2' }]);
  });

  it('updateSkillManifest', async () => {
    await act(async () => {
      dispatcher.updateSkillManifest({ id: 'id1', content: 'newContent' }, projectId);
    });
    expect(renderedComponent.current.skillManifests).toEqual([
      { id: 'id1', content: 'newContent' },
      { id: 'id2', content: 'content2' },
    ]);
  });

  it('displayManifestModal', async () => {
    await act(async () => {
      dispatcher.displayManifestModal('foo');
    });
    expect(renderedComponent.current.displaySkillManifest).toEqual('foo');
  });

  it('dismissManifestModal', async () => {
    await act(async () => {
      dispatcher.dismissManifestModal();
    });
    expect(renderedComponent.current.displaySkillManifest).toBeUndefined();
  });

  it('should update setting.skill on local skills with "Composer Local" chosen as endpoint', async () => {
    await act(async () => {
      const botEndpoints = {};
      botEndpoints[`${skillIds[0]}`] = 'http://localhost:3978/api/messages';
      botEndpoints[`${skillIds[1]}`] = 'http://localhost:3979/api/messages';
      renderedComponent.current.setters.setBotEndpoints(botEndpoints);
      renderedComponent.current.setters.setTodoSkillData({
        location: '/Users/tester/Desktop/LoadedBotProject/Todo-Skill',
        botNameIdentifier: 'todoSkill',
        settings: {
          MicrosoftAppId: 'abc-defg-3431-sdfd',
        },
        displayName: 'todo-skill',
      });

      renderedComponent.current.setters.setGoogleKeepData({
        location: '/Users/tester/Desktop/LoadedBotProject/GoogleKeep-Skill',
        botNameIdentifier: 'googleKeepSync',
        settings: {
          MicrosoftAppId: '1231-1231-1231-1231',
        },
        displayName: 'google-keep',
      });
    });

    await act(async () => {
      dispatcher.updateSettingsForSkillsWithoutManifest();
    });
    // Only skills with no endpoint name in BotProject file use the Local Composer endpoint
    expect(renderedComponent.current.settings).toEqual({
      skill: {
        googleKeepSync: {
          endpointUrl: 'http://localhost:3979/api/messages',
          msAppId: '1231-1231-1231-1231',
        },
      },
    });
  });
});
