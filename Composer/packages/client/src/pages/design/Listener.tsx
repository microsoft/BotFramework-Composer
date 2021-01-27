// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect } from 'react';
import { globalHistory, RouteComponentProps } from '@reach/router';
import { PromptTab, registerEditorAPI } from '@bfc/shared';
import { useRecoilValue } from 'recoil';

import { getDialogData } from '../../utils/dialogUtil';
import { getFocusPath } from '../../utils/navigation';
import { dispatcherState, dialogsSelectorFamily } from '../../recoilModel';
import { undoFunctionState } from '../../recoilModel/undo/history';
import { decodeDesignerPathToArrayPath } from '../../utils/convertUtils/designerPathEncoder';

const getTabFromFragment = () => {
  const tab = window.location.hash.substring(1);

  return Object.values(PromptTab).find((value) => tab === value);
};

const Listener: React.FC<RouteComponentProps<{ dialogId: string; projectId: string; skillId?: string }>> = (props) => {
  const { location, dialogId, projectId = '', skillId = null } = props;
  const dialogs = useRecoilValue(dialogsSelectorFamily(skillId ?? projectId));
  const { undo, redo, clearUndo } = useRecoilValue(undoFunctionState(skillId ?? projectId));

  const { updateDialog, setDesignPageLocation, navTo } = useRecoilValue(dispatcherState);

  // migration: add id to dialog when dialog doesn't have id
  useEffect(() => {
    const currentDialog = dialogs.find(({ id }) => id === dialogId);

    const dialogContent = currentDialog?.content ? Object.assign({}, currentDialog.content) : null;
    if (dialogContent !== null && !dialogContent.id) {
      dialogContent.id = dialogId;
      updateDialog({ id: dialogId, content: dialogContent, projectId });
    }
  }, [dialogId]);

  useEffect(() => {
    if (location && props.dialogId && props.projectId) {
      const { dialogId, projectId } = props;

      let { skillId } = props;
      if (skillId == null) skillId = projectId;

      const params = new URLSearchParams(location.search);
      const dialogMap = dialogs.reduce((acc, { content, id }) => ({ ...acc, [id]: content }), {});
      const dialogData = getDialogData(dialogMap, dialogId);
      const selected = decodeDesignerPathToArrayPath(dialogData, params.get('selected') ?? '');
      const focused = decodeDesignerPathToArrayPath(dialogData, params.get('focused') ?? '');

      //make sure focusPath always valid
      const focusPath = getFocusPath(selected, focused);

      // getDialogData returns whatever's at the end of the path, which could be a trigger or an action
      const possibleAction = getDialogData(dialogMap, dialogId, focusPath);

      if (typeof possibleAction === 'undefined') {
        const { id: foundId } = dialogs.find(({ id }) => id === dialogId) || dialogs.find(({ isRoot }) => isRoot) || {};
        /**
         * It's improper to fallback to `dialogId` directly:
         *   - If 'action' does not exist at `focused` path, fallback to trigger path;
         *   - If 'trigger' does not exist at `selected` path, fallback to dialog Id;
         *   - If 'dialog' does not exist at `dialogId` path, fallback to main dialog.
         */
        if (foundId != null) {
          navTo(skillId ?? projectId, foundId);
        }
        return;
      }

      setDesignPageLocation(skillId ?? projectId, {
        dialogId,
        selected,
        focused,
        promptTab: getTabFromFragment(),
      });

      /* eslint-disable no-underscore-dangle */
      // @ts-ignore
      globalHistory._onTransitionComplete();
      /* eslint-enable */
    }
  }, [location]);

  useEffect(() => {
    registerEditorAPI('Editing', {
      Undo: () => undo(),
      Redo: () => redo(),
    });
    //leave design page should clear the history
    return clearUndo;
  }, []);

  return null;
};

export default Listener;
