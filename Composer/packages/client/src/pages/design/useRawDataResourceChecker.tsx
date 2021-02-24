// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { localeState, lgFileState, designPageLocationState } from '../../recoilModel';

export const useRawDataResourceChecker = (projectId: string) => {
  const { dialogId } = useRecoilValue(designPageLocationState(projectId));
  const locale = useRecoilValue(localeState(projectId));
  const currentLg = useRecoilValue(lgFileState({ projectId, lgFileId: `${dialogId}.${locale}` }));
  const [isRaw, setIsRaw] = useState(currentLg?.rawData ?? true);

  // migration: add id to dialog when dialog doesn't have id
  useEffect(() => {
    if (!currentLg) return;
    if (currentLg.rawData !== isRaw) setIsRaw(currentLg.rawData);
  }, [currentLg]);

  return isRaw;
};

export default useRawDataResourceChecker;
