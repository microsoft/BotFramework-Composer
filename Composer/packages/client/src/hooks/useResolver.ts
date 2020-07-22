// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { useRef } from 'react';
import { importResolverGenerator } from '@bfc/shared';
import { useRecoilValue } from 'recoil';

import { localeState, lgFilesState, luFilesState } from '../recoilModel';

export const useResolvers = () => {
  const lgFiles = useRecoilValue(lgFilesState);
  const locale = useRecoilValue(localeState);
  const luFiles = useRecoilValue(luFilesState);

  const lgFilesRef = useRef(lgFiles);
  lgFilesRef.current = lgFiles;

  const localeRef = useRef(locale);
  localeRef.current = locale;

  const luFilesRef = useRef(luFiles);
  luFilesRef.current = luFiles;

  const lgImportresolver = () => importResolverGenerator(lgFilesRef.current, '.lg');

  const lgFileResolver = (id: string) => {
    const fileId = id.includes('.') ? id : `${id}.${localeRef.current}`;
    return lgFilesRef.current.find(({ id }) => id === fileId);
  };

  const luFileResolver = (id: string) => {
    const fileId = id.includes('.') ? id : `${id}.${localeRef.current}`;
    return luFilesRef.current.find(({ id }) => id === fileId);
  };

  return {
    lgImportresolver,
    luFileResolver,
    lgFileResolver,
  };
};
