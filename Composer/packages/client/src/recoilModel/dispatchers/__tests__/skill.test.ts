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
  id: 'id' + n,
  manifestUrl: 'url' + n,
  name: 'skill' + n,
  description: 'test skill' + n,
  endpointUrl: 'url',
  endpoints: [{ test: 'foo' }],
  msAppId: 'ID',
  content: {
    description: 'test skill' + n,
    endpoints: [{ test: 'foo' }],
  },
});

describe('skill dispatcher', () => {
  let renderedComponent, dispatcher: Dispatcher;
  beforeEach(() => {
    mockDialogComplete.mockClear();

    const useRecoilTestHook = () => {
      const projectId = useRecoilValue(currentProjectIdState);
      const skillManifests = useRecoilValue(skillManifestsState(projectId));
      const onAddSkillDialogComplete = useRecoilValue(onAddSkillDialogCompleteState(projectId));
      const skills: Skill[] = useRecoilValue(skillsState(projectId));
      const settings = useRecoilValue(settingsState(projectId));
      const showAddSkillDialogModal = useRecoilValue(showAddSkillDialogModalState(projectId));
      const displaySkillManifest = useRecoilValue(displaySkillManifestState(projectId));

      const currentDispatcher = useRecoilValue(dispatcherState);

      return {
        projectId,
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

  it('addsSkill', async () => {
    await act(async () => {
      dispatcher.addSkill(projectId, makeTestSkill(3));
    });
    expect(renderedComponent.current.showAddSkillDialogModal).toBe(false);
    expect(renderedComponent.current.onAddSkillDialogComplete.func).toBeUndefined();
    expect(renderedComponent.current.skills).toContainEqual(makeTestSkill(3));
  });

  it('updateSkill', async () => {
    await act(async () => {
      dispatcher.updateSkill(projectId, 'id1', {
        msAppId: 'test',
        manifestUrl: 'test',
        endpointUrl: 'test',
        name: 'test',
      });
    });

    expect(renderedComponent.current.skills[0]).toEqual(
      expect.objectContaining({
        id: 'id1',
        content: {},
        name: 'test',
        msAppId: 'test',
        manifestUrl: 'test',
        endpointUrl: 'test',
        endpoints: [],
      })
    );
  });

  it('removeSkill', async () => {
    await act(async () => {
      dispatcher.removeSkill(projectId, makeTestSkill(1).id);
    });
    expect(renderedComponent.current.skills).not.toContain(makeTestSkill(1));
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
