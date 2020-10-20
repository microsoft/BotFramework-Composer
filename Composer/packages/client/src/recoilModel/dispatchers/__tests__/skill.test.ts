// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { act } from '@botframework-composer/test-utils/lib/hooks';
import { Skill } from '@bfc/shared';

import { skillDispatcher } from '../skill';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import {
  skillManifestsState,
  onAddSkillDialogCompleteState,
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

describe('skill dispatcher', () => {
  let renderedComponent, dispatcher: Dispatcher;
  beforeEach(() => {
    mockDialogComplete.mockClear();

    const useRecoilTestHook = () => {
      const projectId = useRecoilValue(currentProjectIdState);
      const skillManifests = useRecoilValue(skillManifestsState(projectId));
      const onAddSkillDialogComplete = useRecoilValue(onAddSkillDialogCompleteState(projectId));
      const settings = useRecoilValue(settingsState(projectId));
      const showAddSkillDialogModal = useRecoilValue(showAddSkillDialogModalState(projectId));
      const displaySkillManifest = useRecoilValue(displaySkillManifestState(projectId));

      const currentDispatcher = useRecoilValue(dispatcherState);

      return {
        projectId,
        skillManifests,
        onAddSkillDialogComplete,
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
