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
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';

const mockDialogComplete = jest.fn();

describe('skill dispatcher', () => {
  let renderedComponent, dispatcher;
  beforeEach(() => {
    mockDialogComplete.mockClear();

    const useRecoilTestHook = () => {
      const skillManifests = useRecoilValue(skillManifestsState);
      const onAddSkillDialogComplete = useRecoilValue(onAddSkillDialogCompleteState);
      const skills: Skill[] = useRecoilValue(skillsState);
      const settings = useRecoilValue(settingsState);
      const showAddSkillDialogModal = useRecoilValue(showAddSkillDialogModalState);
      const displaySkillManifest = useRecoilValue(displaySkillManifestState);

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
          recoilState: skillManifestsState,
          initialValue: [
            { id: 'id1', content: 'content1' },
            { id: 'id2', content: 'content2' },
          ],
        },
        { recoilState: onAddSkillDialogCompleteState, initialValue: mockDialogComplete },
        {
          recoilState: skillsState,
          initialValue: [],
        },
        { recoilState: settingsState, initialValue: {} },
        { recoilState: showAddSkillDialogModalState, initialValue: false },
        { recoilState: displaySkillManifestState, initialValue: undefined },
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

    console.log(renderedComponent.current.onAddSkillDialogComplete);
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

  describe('updateSkill', () => {
    it('runs', async () => {
      await act(async () => {});
    });
  });

  it('addSkillDialogBegin', async () => {
    const onComplete = () => {};
    await act(async () => {
      dispatcher.addSkillDialogBegin(onComplete);
    });
    expect(renderedComponent.current.showAddSkillDialogModal).toBe(true);
    expect(renderedComponent.current.onAddSkillDialogComplete).toBe(onComplete);
  });

  it('addSkillDialogCancel', async () => {
    await act(async () => {
      dispatcher.addSkillDialogCancel();
    });
    expect(renderedComponent.current.showAddSkillDialogModal).toBe(false);
    expect(renderedComponent.current.onAddSkillDialogComplete).toBe(undefined);
  });

  describe('addSkillDialogSuccess', () => {
    it('with a function in onAddSkillDialogComplete', async () => {
      await act(async () => {
        dispatcher.addSkillDialogBegin(mockDialogComplete);
        dispatcher.addSkillDialogSuccess();
      });
      expect(mockDialogComplete).toHaveBeenCalledWith(null);
      expect(renderedComponent.current.showAddSkillDialogModal).toBe(false);
      expect(renderedComponent.current.onAddSkillDialogComplete).toBe(undefined);
    });

    it('with nothing in onAddSkillDialogComplete', async () => {
      await act(async () => {
        dispatcher.addSkillDialogCancel();
        dispatcher.addSkillDialogSuccess();
      });
      expect(mockDialogComplete).not.toHaveBeenCalled();
      expect(renderedComponent.current.showAddSkillDialogModal).toBe(false);
      expect(renderedComponent.current.onAddSkillDialogComplete).toBe(undefined);
    });
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
