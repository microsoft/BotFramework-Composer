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
  projectIdState,
} from '../../atoms/botState';
import { dispatcherState } from '../../DispatcherWrapper';

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
  let renderedComponent, dispatcher;
  beforeEach(() => {
    mockDialogComplete.mockClear();

    const useRecoilTestHook = () => {
      const projectId = useRecoilValue(projectIdState);
      const skillManifests = useRecoilValue(skillManifestsState);
      const onAddSkillDialogComplete = useRecoilValue(onAddSkillDialogCompleteState);
      const skills: Skill[] = useRecoilValue(skillsState);
      const settings = useRecoilValue(settingsState);
      const showAddSkillDialogModal = useRecoilValue(showAddSkillDialogModalState);
      const displaySkillManifest = useRecoilValue(displaySkillManifestState);

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
          recoilState: skillManifestsState,
          initialValue: [
            { id: 'id1', content: 'content1' },
            { id: 'id2', content: 'content2' },
          ],
        },
        { recoilState: onAddSkillDialogCompleteState, initialValue: { func: undefined } },
        {
          recoilState: skillsState,
          initialValue: [makeTestSkill(1), makeTestSkill(2)],
        },
        {
          recoilState: settingsState,
          initialValue: {
            id1: {
              name: 'id1',
              skillManifestUrl: 'url',
            },
          },
        },
        { recoilState: showAddSkillDialogModalState, initialValue: false },
        { recoilState: displaySkillManifestState, initialValue: undefined },
        { recoilState: projectIdState, initialValue: '123' },
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
      dispatcher.createSkillManifest({ id: 'id3', content: 'content3' });
    });
    expect(renderedComponent.current.skillManifests).toEqual([
      { id: 'id1', content: 'content1' },
      { id: 'id2', content: 'content2' },
      { id: 'id3', content: 'content3' },
    ]);
  });

  it('removeSkillManifest', async () => {
    await act(async () => {
      dispatcher.removeSkillManifest('id1');
    });
    expect(renderedComponent.current.skillManifests).toEqual([{ id: 'id2', content: 'content2' }]);
  });

  it('updateSkillManifest', async () => {
    await act(async () => {
      dispatcher.updateSkillManifest({ id: 'id1', content: 'newContent' });
    });
    expect(renderedComponent.current.skillManifests).toEqual([
      { id: 'id1', content: 'newContent' },
      { id: 'id2', content: 'content2' },
    ]);
  });

  it('addsSkill', async () => {
    await act(async () => {
      dispatcher.addSkill('123', makeTestSkill(3));
    });
    expect(renderedComponent.current.showAddSkillDialogModal).toBe(false);
    expect(renderedComponent.current.onAddSkillDialogComplete.func).toBeUndefined();
    expect(renderedComponent.current.skills).toContainEqual(makeTestSkill(3));
  });

  it('updateSkill', async () => {
    await act(async () => {
      dispatcher.updateSkill('123', 'id1', { msAppId: 'test', manifestUrl: 'test', endpointUrl: 'test', name: 'test' });
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
      dispatcher.removeSkill('123', makeTestSkill(1).id);
    });
    expect(renderedComponent.current.skills).not.toContain(makeTestSkill(1));
  });

  it('addSkillDialogBegin', async () => {
    await act(async () => {
      dispatcher.addSkillDialogBegin(mockDialogComplete);
    });
    expect(renderedComponent.current.showAddSkillDialogModal).toBe(true);
    expect(renderedComponent.current.onAddSkillDialogComplete.func).toBe(mockDialogComplete);
  });

  it('addSkillDialogCancel', async () => {
    await act(async () => {
      dispatcher.addSkillDialogCancel();
    });
    expect(renderedComponent.current.showAddSkillDialogModal).toBe(false);
    expect(renderedComponent.current.onAddSkillDialogComplete.func).toBe(undefined);
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
});
