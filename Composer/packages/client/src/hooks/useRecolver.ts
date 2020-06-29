// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { importResolverGenerator } from '@bfc/shared';
import { useRecoilValue } from 'recoil';
import { useCallback } from 'react';

import { localeState, lgFilesState, luFilesState } from '../recoilModel';

export const useResolvers = () => {
  const lgFiles = useRecoilValue(lgFilesState);
  const locale = useRecoilValue(localeState);
  const luFiles = useRecoilValue(luFilesState);

  const lgImportresolver = useCallback(() => importResolverGenerator(lgFiles, '.lg'), [lgFiles]);

  const lgFileResolver = useCallback(
    (id: string) => {
      const fileId = id.includes('.') ? id : `${id}.${locale}`;
      return lgFiles.find(({ id }) => id === fileId);
    },
    [locale, lgFiles]
  );

  const luFileResolver = useCallback(
    (id: string) => {
      const fileId = id.includes('.') ? id : `${id}.${locale}`;
      return luFiles.find(({ id }) => id === fileId);
    },
    [locale, luFiles]
  );

  return {
    lgImportresolver,
    luFileResolver,
    lgFileResolver,
  };
};
