// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

//TODO: refactor the router to use one-way data flow
import { useRecoilCallback, CallbackInterface } from 'recoil';
import { PromptTab, SDKKinds } from '@bfc/shared';
import cloneDeep from 'lodash/cloneDeep';

import { currentProjectIdState } from '../atoms';
import { encodeArrayPathToDesignerPath } from '../../utils/convertUtils/designerPathEncoder';

import { createSelectedPath, getSelected } from './../../utils/dialogUtil';
import { BreadcrumbItem } from './../../recoilModel/types';
import { breadcrumbState, designPageLocationState, focusPathState, dialogsState } from './../atoms/botState';
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
      projectId: string,
      dialogId: string,
      breadcrumb: BreadcrumbItem[] = []
    ) => {
      const dialogs = await snapshot.getPromise(dialogsState(projectId));
      const designPageLocation = await snapshot.getPromise(designPageLocationState(projectId));
      const updatedBreadcrumb = cloneDeep(breadcrumb);
      set(currentProjectIdState, projectId);

      let path;
      if (dialogId !== designPageLocation.dialogId) {
        const currentDialog = dialogs.find(({ id }) => id === dialogId);
        const beginDialogIndex = currentDialog?.triggers.findIndex(({ type }) => type === SDKKinds.OnBeginDialog);

        if (typeof beginDialogIndex !== 'undefined' && beginDialogIndex >= 0) {
          path = createSelectedPath(beginDialogIndex);
          path = encodeArrayPathToDesignerPath(currentDialog?.content, path);
          updatedBreadcrumb.push({ dialogId, selected: '', focused: '' });
        }
      }

      const currentUri = convertPathToUrl(projectId, dialogId, path);

      if (checkUrl(currentUri, projectId, designPageLocation)) return;

      navigateTo(currentUri, { state: { breadcrumb: updatedBreadcrumb } });
    }
  );

  const selectTo = useRecoilCallback(
    ({ snapshot, set }: CallbackInterface) => async (projectId: string, selectPath: string) => {
      if (!selectPath) return;
      set(currentProjectIdState, projectId);
      const designPageLocation = await snapshot.getPromise(designPageLocationState(projectId));
      const breadcrumb = await snapshot.getPromise(breadcrumbState(projectId));

      // initial dialogId, projectId maybe empty string  ""
      let { dialogId } = designPageLocation;

      if (!dialogId) dialogId = 'Main';

      const dialogs = await snapshot.getPromise(dialogsState(projectId));
      const currentDialog = dialogs.find(({ id }) => id === dialogId);
      const encodedSelectPath = encodeArrayPathToDesignerPath(currentDialog?.content, selectPath);
      const currentUri = convertPathToUrl(projectId, dialogId, encodedSelectPath);

      if (checkUrl(currentUri, projectId, designPageLocation)) return;
      navigateTo(currentUri, { state: { breadcrumb: updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Selected) } });
    }
  );

  const focusTo = useRecoilCallback(
    ({ snapshot, set }: CallbackInterface) => async (projectId: string, focusPath: string, fragment: string) => {
      set(currentProjectIdState, projectId);
      const designPageLocation = await snapshot.getPromise(designPageLocationState(projectId));
      const breadcrumb = await snapshot.getPromise(breadcrumbState(projectId));
      let updatedBreadcrumb = [...breadcrumb];
      const { dialogId, selected } = designPageLocation;

      let currentUri = `/bot/${projectId}/dialogs/${dialogId}`;

      if (focusPath) {
        const dialogs = await snapshot.getPromise(dialogsState(projectId));
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
      if (checkUrl(currentUri, projectId, designPageLocation)) return;
      navigateTo(currentUri, { state: { breadcrumb: updatedBreadcrumb } });
    }
  );

  const selectAndFocus = useRecoilCallback(
    ({ snapshot, set }: CallbackInterface) => async (
      projectId: string,
      dialogId: string,
      selectPath: string,
      focusPath: string,
      breadcrumb: BreadcrumbItem[] = []
    ) => {
      set(currentProjectIdState, projectId);

      const dialogs = await snapshot.getPromise(dialogsState(projectId));
      const currentDialog = dialogs.find(({ id }) => id === dialogId)?.content;
      const encodedSelectPath = encodeArrayPathToDesignerPath(currentDialog, selectPath);
      const encodedFocusPath = encodeArrayPathToDesignerPath(currentDialog, focusPath);
      const search = getUrlSearch(encodedSelectPath, encodedFocusPath);
      const designPageLocation = await snapshot.getPromise(designPageLocationState(projectId));
      if (search) {
        const currentUri = `/bot/${projectId}/dialogs/${dialogId}${search}`;

        if (checkUrl(currentUri, projectId, designPageLocation)) return;
        navigateTo(currentUri, { state: { breadcrumb } });
      } else {
        navTo(projectId, dialogId, breadcrumb);
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
