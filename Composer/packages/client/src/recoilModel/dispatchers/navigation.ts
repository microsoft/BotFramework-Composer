// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

//TODO: refactor the router to use one-way data flow
import { useRecoilCallback, CallbackInterface } from 'recoil';
import { PromptTab, SDKKinds } from '@bfc/shared';
import cloneDeep from 'lodash/cloneDeep';

import { createSelectedPath, getSelected } from './../../utils/dialogUtil';
import { BreadcrumbItem } from './../../recoilModel/types';
import {
  breadcrumbState,
  designPageLocationState,
  dialogsState,
  focusPathState,
  projectIdState,
} from './../atoms/botState';
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
    ({ set }: CallbackInterface) => async ({
      projectId = '',
      dialogId = '',
      selected = '',
      focused = '',
      breadcrumb = [],
      promptTab,
    }) => {
      //generate focusedPath. This will remove when all focusPath related is removed
      let focusPath = dialogId + '#';
      if (focused) {
        focusPath = dialogId + '#.' + focused;
      } else if (selected) {
        focusPath = dialogId + '#.' + selected;
      }

      set(focusPathState, focusPath);
      //add current path to the breadcrumb
      set(breadcrumbState, [...breadcrumb, { dialogId, selected, focused }]);
      set(designPageLocationState, {
        dialogId,
        projectId,
        selected,
        focused,
        promptTab: Object.values(PromptTab).find((value) => promptTab === value),
      });
    }
  );

  const navTo = useRecoilCallback(
    ({ snapshot }: CallbackInterface) => async (dialogId: string, breadcrumb: BreadcrumbItem[] = []) => {
      const projectId = await snapshot.getPromise(projectIdState);
      const designPageLocation = await snapshot.getPromise(designPageLocationState);
      const updatedBreadcrumb = cloneDeep(breadcrumb);

      let path;
      if (dialogId !== designPageLocation.dialogId) {
        // Redirect to Microsoft.OnBeginDialog trigger if it exists on the dialog
        const dialogs = await snapshot.getPromise(dialogsState);
        const currentDialog = dialogs.find(({ id }) => id === dialogId);
        const beginDialogIndex = currentDialog?.triggers.findIndex(({ type }) => type === SDKKinds.OnBeginDialog);

        if (typeof beginDialogIndex !== 'undefined' && beginDialogIndex >= 0) {
          path = createSelectedPath(beginDialogIndex);
          updatedBreadcrumb.push({ dialogId, selected: '', focused: '' });
        }
      }

      const currentUri = convertPathToUrl(projectId, dialogId, path);

      if (checkUrl(currentUri, designPageLocation)) return;
      //if dialog change we should flush some debounced functions

      navigateTo(currentUri, { state: { breadcrumb: updatedBreadcrumb } });
    }
  );

  const selectTo = useRecoilCallback(({ snapshot }: CallbackInterface) => async (selectPath: string) => {
    if (!selectPath) return;
    const designPageLocation = await snapshot.getPromise(designPageLocationState);
    const breadcrumb = await snapshot.getPromise(breadcrumbState);
    const currentProjectId = await snapshot.getPromise(projectIdState);
    // initial dialogId, projectId maybe empty string  ""
    let { dialogId, projectId } = designPageLocation;

    if (!dialogId) dialogId = 'Main';
    if (!projectId) projectId = currentProjectId;

    const currentUri = convertPathToUrl(projectId, dialogId, selectPath);

    if (checkUrl(currentUri, designPageLocation)) return;
    navigateTo(currentUri, { state: { breadcrumb: updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Selected) } });
  });

  const focusTo = useRecoilCallback(
    ({ snapshot }: CallbackInterface) => async (focusPath: string, fragment: string) => {
      const designPageLocation = await snapshot.getPromise(designPageLocationState);
      let breadcrumb = await snapshot.getPromise(breadcrumbState);
      const { dialogId, projectId, selected } = designPageLocation;

      let currentUri = `/bot/${projectId}/dialogs/${dialogId}`;

      if (focusPath) {
        const targetSelected = getSelected(focusPath);
        if (targetSelected !== selected) {
          breadcrumb = updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Selected);
          breadcrumb.push({ dialogId, selected: targetSelected, focused: '' });
        }
        currentUri = `${currentUri}?selected=${targetSelected}&focused=${focusPath}`;
        breadcrumb = updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Focused);
      } else {
        currentUri = `${currentUri}?selected=${selected}`;
        breadcrumb = updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Selected);
      }

      if (fragment && typeof fragment === 'string') {
        currentUri += `#${fragment}`;
      }
      if (checkUrl(currentUri, designPageLocation)) return;
      navigateTo(currentUri, { state: { breadcrumb } });
    }
  );

  const selectAndFocus = useRecoilCallback(
    ({ snapshot }: CallbackInterface) => async (
      dialogId: string,
      selectPath: string,
      focusPath: string,
      breadcrumb: BreadcrumbItem[] = []
    ) => {
      const search = getUrlSearch(selectPath, focusPath);
      const designPageLocation = await snapshot.getPromise(designPageLocationState);
      if (search) {
        const projectId = await snapshot.getPromise(projectIdState);
        const currentUri = `/bot/${projectId}/dialogs/${dialogId}${getUrlSearch(selectPath, focusPath)}`;

        if (checkUrl(currentUri, designPageLocation)) return;
        navigateTo(currentUri, { state: { breadcrumb } });
      } else {
        navTo(dialogId, breadcrumb);
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
