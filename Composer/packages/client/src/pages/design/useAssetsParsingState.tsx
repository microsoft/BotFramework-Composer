// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { localeState, lgFileState, designPageLocationState, luFileState, qnaFileState } from '../../recoilModel';

//check if all the files needed in current page have parse result.
//If some of the files still are still doing the parsing, return true.
// This is use to show <LoadingSpinner /> during the parsing stage.
export const useAssetsParsingState = (projectId: string) => {
  const { dialogId } = useRecoilValue(designPageLocationState(projectId));
  const locale = useRecoilValue(localeState(projectId));
  const currentLg = useRecoilValue(lgFileState({ projectId, lgFileId: `${dialogId}.${locale}` }));
  const currentLu = useRecoilValue(luFileState({ projectId, luFileId: `${dialogId}.${locale}` }));
  const currentQna = useRecoilValue(qnaFileState({ projectId, qnaFileId: `${dialogId}.${locale}` }));
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    const currentAssets = [currentLg, currentLu, currentQna].filter((item) => item.id);

    if (!currentAssets.length) return;

    if (currentAssets.some((item) => item.id && item.isContentUnparsed)) {
      !isParsing && setIsParsing(true);
    } else {
      isParsing && setIsParsing(false);
    }
  }, [currentLg, currentLu, currentQna]);

  return isParsing;
};

export default useAssetsParsingState;
