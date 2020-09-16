// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * luUtil.ts is a single place use lu-parser handle lu file operation.
 * it's designed have no state, input text file, output text file.
 * for more usage detail, please check client/__tests__/utils/luUtil.test.ts
 */
import { QnAFile, DialogInfo } from '@bfc/shared';
import { qnaUtil } from '@bfc/indexers';

import { createFile, updateFile } from '../recoilModel/persistence/http';

import { getBaseName, getExtension } from './fileUtil';

export function getFileLocale(fileName: string) {
  //file name = 'a.en-us.qna'
  return getExtension(getBaseName(fileName));
}
export function getReferredQnaFiles(qnaFiles: QnAFile[], dialogs: DialogInfo[]) {
  return qnaFiles.filter((file) => {
    const idWithOutLocale = getBaseName(file.id);
    return dialogs.some((dialog) => dialog.qnaFile === idWithOutLocale && !!file.content);
  });
}
// substring text file by lines
export function substringTextByLine(text: string, start?: number, end?: number): string {
  return text.split('\n').slice(start, end).join('\n');
}
/**
 * Move qna pair in *.qna to container KB *.source.qna file.
 * @param qnaFiles
 */
export const reformQnAToContainerKB = (projectId: string, qnaFiles: QnAFile[]): QnAFile[] => {
  const qnaFilesNeedMigrate = qnaFiles.filter((file) => {
    return !file.id.endsWith('.source') && file.qnaSections.length;
  });
  if (!qnaFilesNeedMigrate.length) return qnaFiles;
  const updatedFiles: QnAFile[] = [];
  const createdFiles: QnAFile[] = [];
  qnaFilesNeedMigrate.forEach((file) => {
    const { id, content } = file;
    const qnaSectionStartLine = file.qnaSections[0].range?.start.line || 0;
    const content1 = substringTextByLine(content, 0, qnaSectionStartLine - 1);
    const content2 = substringTextByLine(content, qnaSectionStartLine - 1);
    let file1 = qnaUtil.parse(id, content1);
    const file2Id = `${getBaseName(id)}.source`;
    file1 = qnaUtil.addImport(file1, `${file2Id}.qna`);
    updateFile(projectId, `${file1.id}.qna`, file1.content);
    updatedFiles.push(file1);

    const existedFile2 = qnaFiles.find((item) => item.id === file2Id);
    if (existedFile2) {
      const file2Content = existedFile2.content + '\n' + content2;
      const file2 = qnaUtil.parse(file2Id, file2Content);
      updateFile(projectId, `${file2.id}.qna`, file2.content);
      updatedFiles.push(file2);
    } else {
      const file2Content = content2;
      const file2 = qnaUtil.parse(file2Id, file2Content);
      createFile(projectId, `${file2.id}.qna`, file2.content);
      createdFiles.push(file2);
    }
  });

  const newQnAfiles: QnAFile[] = qnaFiles.map((file) => {
    const updated = updatedFiles.find((item) => item.id === file.id);
    return updated || file;
  });
  newQnAfiles.push(...createdFiles);
  return newQnAfiles;
};
