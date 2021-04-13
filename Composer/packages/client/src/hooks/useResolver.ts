// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { useRef } from 'react';
import { lgImportResolverGenerator } from '@bfc/shared';
import { useRecoilValue } from 'recoil';

import { dialogsSelectorFamily, luFilesSelectorFamily, localeState, qnaFilesSelectorFamily } from '../recoilModel';
import { lgFilesSelectorFamily } from '../recoilModel/selectors/lg';

export const useResolvers = (projectId: string) => {
  const dialogs = useRecoilValue(dialogsSelectorFamily(projectId));
  const luFiles = useRecoilValue(luFilesSelectorFamily(projectId));
  const lgFiles = useRecoilValue(lgFilesSelectorFamily(projectId));
  const locale = useRecoilValue(localeState(projectId));
  const qnaFiles = useRecoilValue(qnaFilesSelectorFamily(projectId));

  const lgFilesRef = useRef(lgFiles);
  lgFilesRef.current = lgFiles;

  const localeRef = useRef(locale);
  localeRef.current = locale;

  const luFilesRef = useRef(luFiles);
  luFilesRef.current = luFiles;

  const qnaFilesRef = useRef(qnaFiles);
  qnaFilesRef.current = qnaFiles;

  const dialogsRef = useRef(dialogs);
  dialogsRef.current = dialogs;

  const lgImportresolver = () => lgImportResolverGenerator(lgFilesRef.current, '.lg');

  const lgFileResolver = (id: string) => {
    const fileId = id.includes('.') ? id : `${id}.${localeRef.current}`;
    return lgFilesRef.current.find(({ id }) => id === fileId);
  };

  const luFileResolver = (id: string) => {
    const fileId = id.includes('.') ? id : `${id}.${localeRef.current}`;
    return luFilesRef.current.find(({ id }) => id === fileId);
  };

  const dialogResolver = (dialogId: string) => {
    return dialogsRef.current.find(({ id }) => id === dialogId);
  };

  const qnaFileResolver = (id: string) => {
    const fileId = id.includes('.') ? id : `${id}.${localeRef.current}`;
    return qnaFilesRef.current.find(({ id }) => id === fileId);
  };

  return {
    lgImportresolver,
    luFileResolver,
    lgFileResolver,
    qnaFileResolver,
    dialogResolver,
  };
};
