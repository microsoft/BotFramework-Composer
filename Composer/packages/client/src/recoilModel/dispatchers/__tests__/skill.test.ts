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
  });

  it('createSkillManifest', async () => {
    await act(async () => {
      dispatcher.createSkillManifest({ id: 'id2', content: 'content2' });
    });
    expect(renderedComponent.current.skillManifests).toEqual([
      { id: 'id1', content: 'content1' },
      { id: 'id2', content: 'content2' },
    ]);
  });

  it('removeSkillManifest', async () => {
    await act(async () => {
      dispatcher.removeSkillManifest('id1');
    });
    expect(renderedComponent.current.skillManifests).toEqual([]);
  });

  it('updateSkillManifest', async () => {
    await act(async () => {});
  });

  describe('updateSkill', () => {
    it('runs', async () => {
      await act(async () => {});
    });
  });

  it('addSkillDialogBegin', async () => {
    await act(async () => {});
  });

  it('addSkillDialogCancel', async () => {
    await act(async () => {});
  });

  it('addSkillDialogSuccess', async () => {
    await act(async () => {});
  });

  it('displayManifestModal', async () => {
    await act(async () => {});
  });

  it('dismissManifestModal', async () => {
    await act(async () => {});
  });
});
