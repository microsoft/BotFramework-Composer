// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect } from 'react';
import { globalHistory, WindowLocation } from '@reach/router';
import { LgFile, LuFile, PromptTab, QnAFile } from '@bfc/shared';
import { useRecoilState, useRecoilValue } from 'recoil';

import { getDialogData } from '../../utils/dialogUtil';
import { getFocusPath } from '../../utils/navigation';
import {
  dispatcherState,
  currentDialogState,
  localeState,
  lgFileState,
  lgFilesSelectorFamily,
  luFileState,
  qnaFileState,
  settingsState,
  luFilesSelectorFamily,
} from '../../recoilModel';
import { decodeDesignerPathToArrayPath } from '../../utils/convertUtils/designerPathEncoder';
import lgDiagnosticWorker from '../../recoilModel/parsers/lgDiagnosticWorker';
import luWorker from '../../recoilModel/parsers/luWorker';
import qnaWorker from '../../recoilModel/parsers/qnaWorker';

const getTabFromFragment = () => {
  const tab = window.location.hash.substring(1);

  return Object.values(PromptTab).find((value) => tab === value);
};

export const useEmptyPropsHandler = (
  projectId: string,
  location?: WindowLocation,
  skillId?: string,
  dialogId?: string
) => {
  const activeBot = skillId ?? projectId;

  const currentDialog = useRecoilValue(currentDialogState({ dialogId, projectId: activeBot }));
  const locale = useRecoilValue(localeState(activeBot));
  const settings = useRecoilValue(settingsState(activeBot));
  const [currentLg, setCurrentLg] = useRecoilState(
    lgFileState({ projectId: activeBot, lgFileId: `${dialogId}.${locale}` })
  );
  const [currentLu, setCurrentLu] = useRecoilState(
    luFileState({ projectId: activeBot, luFileId: `${dialogId}.${locale}` })
  );
  const [currentQna, setCurrentQna] = useRecoilState(
    qnaFileState({ projectId: activeBot, qnaFileId: `${dialogId}.${locale}` })
  );
  const lgFiles = useRecoilValue(lgFilesSelectorFamily(projectId));
  const luFiles = useRecoilValue(luFilesSelectorFamily(projectId));
  const { updateDialog, setDesignPageLocation, navTo } = useRecoilValue(dispatcherState);

  // migration: add id to dialog when dialog doesn't have id
  useEffect(() => {
    if (!currentDialog) return;
    const { id, content } = currentDialog;
    const dialogContent = content ? Object.assign({}, content) : null;

    if (dialogContent !== null && !dialogContent.id) {
      dialogContent.id = id;
      updateDialog({ id, content: dialogContent, projectId });
    }
  }, [currentDialog]);

  useEffect(() => {
    if (!currentDialog || !currentLg.id) return;
    let isMounted = true;
    if (currentLg.isContentUnparsed) {
      //for current dialog, check the lg file to make sure the file is parsed.
      lgDiagnosticWorker.parse(activeBot, currentLg.id, currentLg.content, lgFiles).then((result) => {
        isMounted ? setCurrentLg(result as LgFile) : null;
      });
    }

    return () => {
      isMounted = false;
    };
  }, [currentDialog, currentLg, lgFiles]);

  useEffect(() => {
    if (!currentDialog || !currentLu.id) return;
    let isMounted = true;
    if (currentLu.isContentUnparsed) {
      //for current dialog, check the lu file to make sure the file is parsed.
      luWorker.parse(currentLu.id, currentLu.content, settings.luFeatures, luFiles).then((result) => {
        isMounted ? setCurrentLu(result as LuFile) : null;
      });
      return () => {
        isMounted = false;
      };
    }
  }, [currentDialog, currentLu, luFiles]);

  useEffect(() => {
    if (!currentDialog || !currentQna.id) return;
    let isMounted = true;
    if (currentQna.isContentUnparsed) {
      //for current dialog, check the qna file to make sure the file is parsed.
      qnaWorker.parse(currentQna.id, currentQna.content).then((result) => {
        isMounted ? setCurrentQna(result as QnAFile) : null;
      });
    }
    return () => {
      isMounted = false;
    };
  }, [currentDialog, currentQna]);

  useEffect(() => {
    if (!location || !currentDialog || !activeBot) return;

    const { id, content } = currentDialog;
    const params = new URLSearchParams(location.search);
    const selected = decodeDesignerPathToArrayPath(content, params.get('selected') ?? '');
    const focused = decodeDesignerPathToArrayPath(content, params.get('focused') ?? '');

    //make sure focusPath always valid
    const focusPath = getFocusPath(selected, focused);

    // getDialogData returns whatever's at the end of the path, which could be a trigger or an action
    const possibleAction = getDialogData({ [id]: content }, id, focusPath);

    if (typeof possibleAction === 'undefined' || dialogId !== currentDialog.id) {
      /**
       * It's improper to fallback to `dialogId` directly:
       *   - If 'action' does not exist at `focused` path, fallback to trigger path;
       *   - If 'trigger' does not exist at `selected` path, fallback to dialog Id;
       *   - If 'dialog' does not exist at `dialogId` path, fallback to main dialog.
       * if the dialogId does not exist, the currentDialog will be the main dialog
       */
      navTo(activeBot, currentDialog.id);
      return;
    }

    setDesignPageLocation(activeBot, {
      dialogId: id,
      selected,
      focused,
      promptTab: getTabFromFragment(),
    });

    /* eslint-disable no-underscore-dangle */
    // @ts-ignore
    globalHistory._onTransitionComplete();
    /* eslint-enable */
  }, [location, activeBot, currentDialog, dialogId]);
};

export default useEmptyPropsHandler;
