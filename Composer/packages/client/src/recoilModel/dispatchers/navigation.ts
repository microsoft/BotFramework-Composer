// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

//TODO: refactor the router to use one-way data flow
import { useRecoilCallback, CallbackInterface } from 'recoil';
import { PromptTab } from '@bfc/shared';
import isEqual from 'lodash/isEqual';

import { currentProjectIdState } from '../atoms';
import { encodeArrayPathToDesignerPath } from '../../utils/convertUtils/designerPathEncoder';
import { dialogsSelectorFamily, rootBotProjectIdSelector } from '../selectors';
import { DesignPageLocation } from '../types';

import { getSelected } from './../../utils/dialogUtil';
import { designPageLocationState, focusPathState } from './../atoms/botState';
import { checkUrl, convertPathToUrl, getUrlSearch, navigateTo } from './../../utils/navigation';

const setCurrentProjectId = async ({ set, snapshot }: CallbackInterface, projectId: string) => {
  const currentProjectId = await snapshot.getPromise(currentProjectIdState);
  if (currentProjectId !== projectId) {
    set(currentProjectIdState, projectId);
  }
};

export const navigationDispatcher = () => {
  const setDesignPageLocation = useRecoilCallback(
    (callbackInterface: CallbackInterface) => async (projectId: string, location: DesignPageLocation) => {
      const { set, snapshot } = callbackInterface;

      await setCurrentProjectId(callbackInterface, projectId);

      const preLocation = await snapshot.getPromise(designPageLocationState(projectId));

      if (isEqual(preLocation, location)) return;

      const { dialogId = '', selected = '', focused = '' } = location;
      const focusPath = `${dialogId}#${focused ? `.${focused}` : selected ? `.${selected}` : ''}`;
      set(focusPathState(projectId), focusPath);
      set(designPageLocationState(projectId), location);
    }
  );

  const navTo = useRecoilCallback(
    (callbackInterface: CallbackInterface) => async (
      skillId: string | null,
      dialogId: string | null,
      trigger?: string
    ) => {
      const { set, snapshot } = callbackInterface;
      const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
      if (rootBotProjectId == null) return;

      const projectId = skillId ?? rootBotProjectId;

      await setCurrentProjectId(callbackInterface, projectId);

      const currentUri =
        trigger == null
          ? convertPathToUrl(rootBotProjectId, skillId, dialogId)
          : convertPathToUrl(rootBotProjectId, skillId, dialogId, `selected=triggers[${trigger}]`);

      set(designPageLocationState(projectId), {
        dialogId: dialogId ?? '',
        selected: trigger ?? '',
        focused: '',
        promptTab: undefined,
      });
      navigateTo(currentUri);
    }
  );

  const selectTo = useRecoilCallback(
    (callbackInterface: CallbackInterface) => async (
      skillId: string | null,
      destinationDialogId: string | null,
      selectPath: string
    ) => {
      if (!selectPath) return;

      const { set, snapshot } = callbackInterface;
      const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
      if (rootBotProjectId == null) return;

      const projectId = skillId ?? rootBotProjectId;

      await setCurrentProjectId(callbackInterface, projectId);

      const designPageLocation = await snapshot.getPromise(designPageLocationState(projectId));

      // target dialogId, projectId maybe empty string  ""
      const dialogId = destinationDialogId ?? designPageLocation.dialogId ?? 'Main';

      const dialogs = await snapshot.getPromise(dialogsSelectorFamily(projectId));
      const currentDialog = dialogs.find(({ id }) => id === dialogId);
      const encodedSelectPath = encodeArrayPathToDesignerPath(currentDialog?.content, selectPath);
      const currentUri = convertPathToUrl(rootBotProjectId, skillId, dialogId, encodedSelectPath);

      if (checkUrl(currentUri, rootBotProjectId, skillId, designPageLocation)) return;
      set(designPageLocationState(projectId), {
        dialogId,
        selected: selectPath,
        focused: '',
        promptTab: undefined,
      });
      navigateTo(currentUri);
    }
  );

  const focusTo = useRecoilCallback(
    (callbackInterface: CallbackInterface) => async (
      projectId: string,
      skillId: string | null,
      focusPath: string,
      fragment: string
    ) => {
      const { set, snapshot } = callbackInterface;
      await setCurrentProjectId(callbackInterface, skillId ?? projectId);

      const designPageLocation = await snapshot.getPromise(designPageLocationState(skillId ?? projectId));
      const { dialogId, selected } = designPageLocation;

      let currentUri =
        skillId == null || skillId === projectId
          ? `/bot/${projectId}/dialogs/${dialogId}`
          : `/bot/${projectId}/skill/${skillId}/dialogs/${dialogId}`;

      if (focusPath) {
        const dialogs = await snapshot.getPromise(dialogsSelectorFamily(skillId ?? projectId));
        const currentDialog = dialogs.find(({ id }) => id === dialogId);
        const encodedFocusPath = encodeArrayPathToDesignerPath(currentDialog?.content, focusPath);

        const targetSelected = getSelected(encodedFocusPath);

        currentUri = `${currentUri}?selected=${targetSelected}&focused=${encodedFocusPath}`;
      } else {
        currentUri = `${currentUri}?selected=${selected}`;
      }

      if (fragment && typeof fragment === 'string') {
        currentUri += `#${fragment}`;
      }
      if (checkUrl(currentUri, projectId, skillId, designPageLocation)) return;

      set(designPageLocationState(skillId || projectId), {
        dialogId,
        selected: getSelected(focusPath) || selected,
        focused: focusPath ?? '',
        promptTab: Object.values(PromptTab).find((value) => fragment === value),
      });
      navigateTo(currentUri);
    }
  );

  const selectAndFocus = useRecoilCallback(
    ({ snapshot, set }: CallbackInterface) => async (
      projectId: string,
      skillId: string | null,
      dialogId: string,
      selectPath: string,
      focusPath: string,
      fragment?: string
    ) => {
      set(currentProjectIdState, projectId);

      const dialogs = await snapshot.getPromise(dialogsSelectorFamily(projectId));
      const currentDialog = dialogs.find(({ id }) => id === dialogId)?.content;
      const encodedSelectPath = encodeArrayPathToDesignerPath(currentDialog, selectPath);
      const encodedFocusPath = encodeArrayPathToDesignerPath(currentDialog, focusPath);
      const search = getUrlSearch(encodedSelectPath, encodedFocusPath);
      const designPageLocation = await snapshot.getPromise(designPageLocationState(projectId));
      if (search) {
        let currentUri =
          skillId == null || skillId === projectId
            ? `/bot/${projectId}/dialogs/${dialogId}${search}`
            : `/bot/${projectId}/skill/${skillId}/dialogs/${dialogId}${search}`;

        if (fragment && typeof fragment === 'string') {
          currentUri += `#${fragment}`;
        }

        if (checkUrl(currentUri, projectId, skillId, designPageLocation)) return;

        set(designPageLocationState(projectId), {
          dialogId,
          selected: getSelected(focusPath) || selectPath,
          focused: focusPath ?? '',
          promptTab: Object.values(PromptTab).find((value) => fragment === value),
        });
        navigateTo(currentUri);
      } else {
        navTo(skillId ?? projectId, dialogId);
      }
    }
  );

  return {
    setDesignPageLocation,
    navTo,
    selectTo,
    focusTo,
    selectAndFocus,
  };
};
