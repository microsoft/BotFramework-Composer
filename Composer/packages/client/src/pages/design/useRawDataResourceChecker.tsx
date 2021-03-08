// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { localeState, lgFileState, designPageLocationState, luFileState, qnaFileState } from '../../recoilModel';

export const useRawDataResourceChecker = (projectId: string) => {
  const { dialogId } = useRecoilValue(designPageLocationState(projectId));
  const locale = useRecoilValue(localeState(projectId));
  const currentLg = useRecoilValue(lgFileState({ projectId, lgFileId: `${dialogId}.${locale}` }));
  const currentLu = useRecoilValue(luFileState({ projectId, luFileId: `${dialogId}.${locale}` }));
  const currentQna = useRecoilValue(qnaFileState({ projectId, qnaFileId: `${dialogId}.${locale}` }));
  const [isRaw, setIsRaw] = useState(currentLg?.isContentUnparsed || currentLu?.isContentUnparsed || currentQna?.isContentUnparsed);
  // migration: add id to dialog when dialog doesn't have id
  useEffect(() => {
    if (!currentLg.id || !currentLu.id || !currentQna.id) return;
    if (!currentLg.isContentUnparsed && !currentQna.isContentUnparsed && !currentLu.isContentUnparsed && isRaw === true) {
      setIsRaw(false);
      return;
    }
    if ((currentLg?.isContentUnparsed || currentLu?.isContentUnparsed || currentQna?.isContentUnparsed) && isRaw === false) setIsRaw(true);
  }, [currentLg, currentLu, currentQna]);

  return isRaw;
};

export default useRawDataResourceChecker;
