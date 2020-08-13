// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { act } from '@bfc/test-utils/lib/hooks';
import { Skill } from '@bfc/shared';

import { skillDispatcher } from '../skill';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import {
  skillManifestsState,
  onAddSkillDialogCompleteState,
  skillsState,
  settingsState,
  showAddSkillDialogModalState,
  displaySkillManifestState,
} from '../../atoms/botState';
import { dispatcherState } from '../../DispatcherWrapper';
import { botStateByProjectIdSelector } from '../../selectors';
import { currentProjectIdState } from '../../atoms';
import { Dispatcher } from '..';

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

const makeTestSkill: (number) => Skill = (n) => ({
  manifestUrl: 'url',
  name: 'skill' + n,
  protocol: 'GET',
  description: 'test skill' + n,
  endpointUrl: 'url',
  endpoints: [{ test: 'foo' }],
  msAppId: 'ID',
  body: 'body',
});

describe('skill dispatcher', () => {
  let renderedComponent, dispatcher: Dispatcher;
  beforeEach(() => {
    mockDialogComplete.mockClear();

    const useRecoilTestHook = () => {
      const {
        skillManifests,
        onAddSkillDialogComplete,
        skills,
        dialogSetting: settings,
        showAddSkillDialogModal,
        displaySkillManifest,
      } = useRecoilValue(botStateByProjectIdSelector);

      const currentDispatcher = useRecoilValue(dispatcherState);

      return {
        skillManifests,
        onAddSkillDialogComplete,
        skills,
        settings,
        showAddSkillDialogModal,
        displaySkillManifest,
        currentDispatcher,
      };
    };

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
        {
          recoilState: skillsState(projectId),
          initialValue: [makeTestSkill(1), makeTestSkill(2)],
        },
        { recoilState: settingsState(projectId), initialValue: {} },
        { recoilState: showAddSkillDialogModalState(projectId), initialValue: false },
        { recoilState: displaySkillManifestState(projectId), initialValue: undefined },
        { recoilState: currentProjectIdState, initialValue: projectId },
      ],
      dispatcher: {
        recoilState: dispatcherState,
        initialValue: {
          skillDispatcher,
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

  describe('updateSkill', () => {
    it('adds a skill', async () => {
      await act(async () => {
        dispatcher.updateSkill({
          projectId: 'projectId',
          targetId: -1,
          skillData: makeTestSkill(3),
        });
      });
      expect(renderedComponent.current.showAddSkillDialogModal).toBe(false);
      expect(renderedComponent.current.onAddSkillDialogComplete.func).toBeUndefined();
      //   expect(renderedComponent.current.settingsState.skill).toContain({
      //     manifestUrl: 'url',
      //     name: 'skill3',
      //   });
      expect(renderedComponent.current.skills).toContainEqual(makeTestSkill(3));
    });
    it('modifies a skill', async () => {
      await act(async () => {
        dispatcher.updateSkill({
          projectId: 'projectId',
          targetId: 0,
          skillData: makeTestSkill(100),
        });
      });
      expect(renderedComponent.current.showAddSkillDialogModal).toBe(false);
      expect(renderedComponent.current.onAddSkillDialogComplete.func).toBeUndefined();
      //   expect(renderedComponent.current.settingsState.skill).toContain({
      //     manifestUrl: 'url',
      //     name: 'skill100',
      //   });
      expect(renderedComponent.current.skills).not.toContain(makeTestSkill(1));
      expect(renderedComponent.current.skills).toContainEqual(makeTestSkill(100));
    });
    it('deletes a skill', async () => {
      await act(async () => {
        dispatcher.updateSkill({
          projectId,
          targetId: 0,
          skillData: {},
        });
      });
      expect(renderedComponent.current.showAddSkillDialogModal).toBe(false);
      expect(renderedComponent.current.onAddSkillDialogComplete.func).toBeUndefined();
      expect(renderedComponent.current.skills).not.toContain(makeTestSkill(1));
    });
  });

  it('addSkillDialogBegin', async () => {
    await act(async () => {
      dispatcher.addSkillDialogBegin(mockDialogComplete, projectId);
    });
    expect(renderedComponent.current.showAddSkillDialogModal).toBe(true);
    expect(renderedComponent.current.onAddSkillDialogComplete.func).toBe(mockDialogComplete);
  });

  it('addSkillDialogCancel', async () => {
    await act(async () => {
      dispatcher.addSkillDialogCancel(projectId);
    });
    expect(renderedComponent.current.showAddSkillDialogModal).toBe(false);
    expect(renderedComponent.current.onAddSkillDialogComplete.func).toBe(undefined);
  });

  describe('addSkillDialogSuccess', () => {
    it('with a function in onAddSkillDialogComplete', async () => {
      await act(async () => {
        dispatcher.addSkillDialogBegin(mockDialogComplete, projectId);
      });
      await act(async () => {
        dispatcher.addSkillDialogSuccess(projectId);
      });
      expect(mockDialogComplete).toHaveBeenCalledWith(null);
      expect(renderedComponent.current.showAddSkillDialogModal).toBe(false);
      expect(renderedComponent.current.onAddSkillDialogComplete.func).toBe(undefined);
    });

    it('with nothing in onAddSkillDialogComplete', async () => {
      await act(async () => {
        dispatcher.addSkillDialogCancel(projectId);
      });
      await act(async () => {
        dispatcher.addSkillDialogSuccess(projectId);
      });
      expect(mockDialogComplete).not.toHaveBeenCalled();
      expect(renderedComponent.current.showAddSkillDialogModal).toBe(false);
      expect(renderedComponent.current.onAddSkillDialogComplete.func).toBe(undefined);
    });
  });

  it('displayManifestModal', async () => {
    await act(async () => {
      dispatcher.displayManifestModal('foo', projectId);
    });
    expect(renderedComponent.current.displaySkillManifest).toEqual('foo');
  });

  it('dismissManifestModal', async () => {
    await act(async () => {
      dispatcher.dismissManifestModal(projectId);
    });
    expect(renderedComponent.current.displaySkillManifest).toBeUndefined();
  });
});
