// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

//TODO: refactor the router to use one-way data flow
import { useRecoilCallback, CallbackInterface } from 'recoil';
import { PromptTab } from '@bfc/shared';

import { botStateByProjectIdSelector } from '../selectors';

import { getSelected } from './../../utils/dialogUtil';
import { BreadcrumbItem } from './../../recoilModel/types';
import { focusPathState, breadcrumbState, designPageLocationState, currentProjectIdState } from './../atoms';
import { updateBreadcrumb, navigateTo, checkUrl, getUrlSearch, BreadcrumbUpdateType } from './../../utils/navigation';

export const navigationDispatcher = () => {
  const setDesignPageLocation = useRecoilCallback(
    ({ set }: CallbackInterface) => async ({
      projectId,
      dialogId = '',
      selected = '',
      focused = '',
      breadcrumb = [],
      promptTab,
    }) => {
      //generate focusedPath. This will remove when all focusPath related is removed
      set(currentProjectIdState, projectId);

      let focusPath = dialogId + '#';
      if (focused) {
        focusPath = dialogId + '#.' + focused;
      } else if (selected) {
        focusPath = dialogId + '#.' + selected;
      }

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
    ({ snapshot }: CallbackInterface) => async (
      projectId: string,
      dialogId: string,
      breadcrumb: BreadcrumbItem[] = []
    ) => {
      const designPageLocation = await snapshot.getPromise(designPageLocationState(projectId));
      const currentUri = `/bot/${projectId}/dialogs/${dialogId}`;
      if (checkUrl(currentUri, designPageLocation)) return;
      //if dialog change we should flush some debounced functions

      navigateTo(currentUri, { state: { breadcrumb } });
    }
  );

  const selectTo = useRecoilCallback(
    ({ snapshot }: CallbackInterface) => async (projectId: string, selectPath: string) => {
      if (!selectPath) return;
      const designPageLocation = await snapshot.getPromise(designPageLocationState(projectId));
      const breadcrumb = await snapshot.getPromise(breadcrumbState(projectId));

      // initial dialogId, projectId maybe empty string  ""
      let { dialogId } = designPageLocation;

      if (!dialogId) dialogId = 'Main';

      let currentUri = `/bot/${projectId}/dialogs/${dialogId}`;

      currentUri = `${currentUri}?selected=${selectPath}`;

      if (checkUrl(currentUri, designPageLocation)) return;
      navigateTo(currentUri, { state: { breadcrumb: updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Selected) } });
    }
  );

  const focusTo = useRecoilCallback(
    ({ snapshot }: CallbackInterface) => async (projectId: string, focusPath: string, fragment: string) => {
      const designPageLocation = await snapshot.getPromise(designPageLocationState(projectId));
      const { breadcrumb } = await snapshot.getPromise(botStateByProjectIdSelector);
      let updatedBreadcrumb = [...breadcrumb];
      const { dialogId, selected } = designPageLocation;

      let currentUri = `/bot/${projectId}/dialogs/${dialogId}`;

      if (focusPath) {
        const targetSelected = getSelected(focusPath);
        if (targetSelected !== selected) {
          updatedBreadcrumb = updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Selected);
          updatedBreadcrumb.push({ dialogId, selected: targetSelected, focused: '' });
        }
        currentUri = `${currentUri}?selected=${targetSelected}&focused=${focusPath}`;
        updatedBreadcrumb = updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Focused);
      } else {
        currentUri = `${currentUri}?selected=${selected}`;
        updatedBreadcrumb = updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Selected);
      }

      if (fragment && typeof fragment === 'string') {
        currentUri += `#${fragment}`;
      }
      if (checkUrl(currentUri, designPageLocation)) return;
      navigateTo(currentUri, { state: { breadcrumb: updatedBreadcrumb } });
    }
  );

  const selectAndFocus = useRecoilCallback(
    ({ snapshot }: CallbackInterface) => async (
      projectId: string,
      dialogId: string,
      selectPath: string,
      focusPath: string,
      breadcrumb: BreadcrumbItem[] = []
    ) => {
      const search = getUrlSearch(selectPath, focusPath);
      const designPageLocation = await snapshot.getPromise(designPageLocationState(projectId));
      if (search) {
        const currentUri = `/bot/${projectId}/dialogs/${dialogId}${getUrlSearch(selectPath, focusPath)}`;

        if (checkUrl(currentUri, designPageLocation)) return;
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
