// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

//TODO: refactor the router to use one-way data flow
import { PromptTab } from '@bfc/shared';
import { useRecoilCallback, CallbackInterface } from 'recoil';

import { getSelected } from './../../utils';
import { BreadcrumbItem } from './../../store/types';
import { focusPathState, breadcrumbState, designPageLocationState, projectIdState } from './../atoms/botState';
import { updateBreadcrumb, navigateTo, checkUrl, getUrlSearch, BreadcrumbUpdateType } from './../../utils/navigation';

export const navigationDispatcher = () => {
  const setDesignPageLocation = useRecoilCallback<
    [
      {
        projectId: string;
        dialogId: string;
        selected: string;
        focused: string;
        breadcrumb: BreadcrumbItem[];
        onBreadcrumbItemClick: any;
        promptTab: PromptTab;
      }
    ],
    Promise<void>
  >(
    ({ set, snapshot }: CallbackInterface) => async ({
      projectId = '',
      dialogId = '',
      selected = '',
      focused = '',
      breadcrumb = [],
      onBreadcrumbItemClick,
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
      set(designPageLocationState, { dialogId, projectId, selected, focused, promptTab });
    }
  );

  const navTo = useRecoilCallback<[string, BreadcrumbItem[]], Promise<void>>(
    ({ snapshot }: CallbackInterface) => async (dialogId, breadcrumb = []) => {
      const projectId = await snapshot.getPromise(projectIdState);
      const designPageLocation = await snapshot.getPromise(designPageLocationState);
      const currentUri = `/bot/${projectId}/dialogs/${dialogId}`;
      if (checkUrl(currentUri, designPageLocation)) return;
      //if dialog change we should flush some debounced functions
      navigateTo(currentUri, { state: { breadcrumb } });
    }
  );

  const selectTo = useRecoilCallback<[string], Promise<void>>(
    ({ snapshot }: CallbackInterface) => async (selectPath: string) => {
      if (!selectPath) return;
      const designPageLocation = await snapshot.getPromise(designPageLocationState);
      const breadcrumb = await snapshot.getPromise(breadcrumbState);
      const currentProjectId = await snapshot.getPromise(projectIdState);
      // initial dialogId, projectId maybe empty string  ""
      let { dialogId, projectId } = designPageLocation;

      if (!dialogId) dialogId = 'Main';
      if (!projectId) projectId = currentProjectId;

      let currentUri = `/bot/${projectId}/dialogs/${dialogId}`;

      currentUri = `${currentUri}?selected=${selectPath}`;

      if (checkUrl(currentUri, designPageLocation)) return;
      navigateTo(currentUri, { state: { breadcrumb: updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Selected) } });
    }
  );

  const focusTo = useRecoilCallback<[string, string], Promise<void>>(
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

  const setectAndfocus = useRecoilCallback<[string, string, string, BreadcrumbItem[]], Promise<void>>(
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
    setectAndfocus,
  };
};
