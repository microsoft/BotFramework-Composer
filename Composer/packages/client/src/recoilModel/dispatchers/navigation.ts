// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

//TODO: refactor the router to use one-way data flow
import { useRecoilCallback, CallbackInterface } from 'recoil';
import { PromptTab } from '@bfc/shared';

import { currentProjectIdState } from '../atoms';
import { encodeArrayPathToDesignerPath } from '../../utils/convertUtils/designerPathEncoder';
import { dialogsSelectorFamily, rootBotProjectIdSelector } from '../selectors';

import { getSelected } from './../../utils/dialogUtil';
import { BreadcrumbItem } from './../../recoilModel/types';
import { breadcrumbState, designPageLocationState, focusPathState } from './../atoms/botState';
import {
  BreadcrumbUpdateType,
  checkUrl,
  convertPathToUrl,
  getUrlSearch,
  navigateTo,
  updateBreadcrumb,
} from './../../utils/navigation';

export const navigationDispatcher = () => {
  const setDesignPageLocation = useRecoilCallback(
    ({ set }: CallbackInterface) => async (
      projectId: string,
      { dialogId = '', selected = '', focused = '', breadcrumb = [], promptTab }
    ) => {
      let focusPath = dialogId + '#';
      if (focused) {
        focusPath = dialogId + '#.' + focused;
      } else if (selected) {
        focusPath = dialogId + '#.' + selected;
      }
      set(currentProjectIdState, projectId);
      set(focusPathState(projectId), focusPath);
      //add current path to the breadcrumb
      set(breadcrumbState(projectId), [...breadcrumb, { dialogId, selected, focused }]);
      set(designPageLocationState(projectId), {
        dialogId,
        selected,
        focused,
        promptTab: Object.values(PromptTab).find((value) => promptTab === value),
      });
    }
  );

  const navTo = useRecoilCallback(
    ({ snapshot, set }: CallbackInterface) => async (
      skillId: string | null,
      dialogId: string | null,
      breadcrumb: BreadcrumbItem[] = []
    ) => {
      const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
      if (rootBotProjectId == null) return;

      const projectId = skillId ?? rootBotProjectId;

      const designPageLocation = await snapshot.getPromise(designPageLocationState(projectId));
      set(currentProjectIdState, projectId);

      const currentUri = convertPathToUrl(rootBotProjectId, projectId, dialogId);
      if (checkUrl(currentUri, rootBotProjectId, projectId, designPageLocation)) return;

      navigateTo(currentUri, { state: { breadcrumb } });
    }
  );

  const selectTo = useRecoilCallback(
    ({ snapshot, set }: CallbackInterface) => async (
      skillId: string | null,
      destinationDialogId: string | null,
      selectPath: string
    ) => {
      if (!selectPath) return;
      const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
      if (rootBotProjectId == null) return;

      const projectId = skillId ?? rootBotProjectId;

      set(currentProjectIdState, projectId);
      const designPageLocation = await snapshot.getPromise(designPageLocationState(projectId));
      const breadcrumb = await snapshot.getPromise(breadcrumbState(projectId));

      // target dialogId, projectId maybe empty string  ""
      const dialogId = destinationDialogId ?? designPageLocation.dialogId ?? 'Main';

      const dialogs = await snapshot.getPromise(dialogsSelectorFamily(projectId));
      const currentDialog = dialogs.find(({ id }) => id === dialogId);
      const encodedSelectPath = encodeArrayPathToDesignerPath(currentDialog?.content, selectPath);
      const currentUri = convertPathToUrl(rootBotProjectId, skillId, dialogId, encodedSelectPath);

      if (checkUrl(currentUri, rootBotProjectId, skillId, designPageLocation)) return;
      navigateTo(currentUri, { state: { breadcrumb: updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Selected) } });
    }
  );

  const focusTo = useRecoilCallback(
    ({ snapshot, set }: CallbackInterface) => async (
      projectId: string,
      skillId: string | null,
      focusPath: string,
      fragment: string
    ) => {
      set(currentProjectIdState, skillId ?? projectId);
      const designPageLocation = await snapshot.getPromise(designPageLocationState(skillId ?? projectId));
      const breadcrumb = await snapshot.getPromise(breadcrumbState(skillId ?? projectId));
      let updatedBreadcrumb = [...breadcrumb];
      const { dialogId, selected } = designPageLocation;

      let currentUri =
        skillId == null
          ? `/bot/${projectId}/dialogs/${dialogId}`
          : `/bot/${projectId}/skill/${skillId}/dialogs/${dialogId}`;

      if (focusPath) {
        const dialogs = await snapshot.getPromise(dialogsSelectorFamily(skillId ?? projectId));
        const currentDialog = dialogs.find(({ id }) => id === dialogId);
        const encodedFocusPath = encodeArrayPathToDesignerPath(currentDialog?.content, focusPath);

        const targetSelected = getSelected(encodedFocusPath);
        if (targetSelected !== selected) {
          updatedBreadcrumb = updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Selected);
          updatedBreadcrumb.push({ dialogId, selected: targetSelected, focused: '' });
        }
        currentUri = `${currentUri}?selected=${targetSelected}&focused=${encodedFocusPath}`;
        updatedBreadcrumb = updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Focused);
      } else {
        currentUri = `${currentUri}?selected=${selected}`;
        updatedBreadcrumb = updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Selected);
      }

      if (fragment && typeof fragment === 'string') {
        currentUri += `#${fragment}`;
      }
      if (checkUrl(currentUri, projectId, skillId, designPageLocation)) return;
      navigateTo(currentUri, { state: { breadcrumb: updatedBreadcrumb } });
    }
  );

  const selectAndFocus = useRecoilCallback(
    ({ snapshot, set }: CallbackInterface) => async (
      projectId: string,
      skillId: string | null,
      dialogId: string,
      selectPath: string,
      focusPath: string,
      breadcrumb: BreadcrumbItem[] = []
    ) => {
      set(currentProjectIdState, projectId);

      const dialogs = await snapshot.getPromise(dialogsSelectorFamily(projectId));
      const currentDialog = dialogs.find(({ id }) => id === dialogId)?.content;
      const encodedSelectPath = encodeArrayPathToDesignerPath(currentDialog, selectPath);
      const encodedFocusPath = encodeArrayPathToDesignerPath(currentDialog, focusPath);
      const search = getUrlSearch(encodedSelectPath, encodedFocusPath);
      const designPageLocation = await snapshot.getPromise(designPageLocationState(projectId));
      if (search) {
        const currentUri =
          skillId == null
            ? `/bot/${projectId}/dialogs/${dialogId}${search}`
            : `/bot/${projectId}/skill/${skillId}/dialogs/${dialogId}${search}`;

        if (checkUrl(currentUri, projectId, skillId, designPageLocation)) return;
        navigateTo(currentUri, { state: { breadcrumb } });
      } else {
        navTo(skillId ?? projectId, dialogId, breadcrumb);
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
