// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * luUtil.ts is a single place use lu-parser handle lu file operation.
 * it's designed have no state, input text file, output text file.
 * for more usage detail, please check client/__tests__/utils/luUtil.test.ts
 */
import { QnAFile, DialogInfo } from '@bfc/shared';
import { qnaUtil, BotIndexer } from '@bfc/indexers';

import { createFile, updateFile, deleteFile } from '../recoilModel/persistence/http';

import { getBaseName, getExtension } from './fileUtil';

export const getFileLocale = (fileName: string) => {
  //file name = 'a.en-us.qna'
  return getExtension(getBaseName(fileName));
};
export const getReferredQnaFiles = (qnaFiles: QnAFile[], dialogs: DialogInfo[], checkContent = true) => {
  return qnaFiles.filter((file) => {
    const idWithOutLocale = getBaseName(file.id);
    const contentNotEmpty = (checkContent && !!file.content) || !checkContent;
    return dialogs.some((dialog) => dialog.qnaFile === idWithOutLocale && contentNotEmpty);
  });
};

export const checkQnaBuild = (qnaFiles: QnAFile[], dialogs: DialogInfo[]) => {
  const referred = getReferredQnaFiles(qnaFiles, dialogs, false);

  // supported QnA locale.
  const supported = BotIndexer.filterQnAFilesToPublish(referred);
  return supported;
};

// substring text file by lines
export const substringTextByLine = (text: string, start?: number, end?: number): string => {
  return text.split('\n').slice(start, end).join('\n');
};
/**
 * Migrate qna pair in <dialog>.qna to container KB <dialog>-munual.source.qna file.
 * @param qnaFiles
 */
export const reformQnAToContainerKB = (projectId: string, qnaFiles: QnAFile[], locales: string[]): QnAFile[] => {
  const qnaFilesNeedMigrate = qnaFiles.filter((file) => {
    return !file.id.endsWith('.source') && !locales.includes(file.id.split('.source.')[1]) && file.qnaSections.length;
  });
  if (!qnaFilesNeedMigrate.length) return qnaFiles;
  const updatedFiles: QnAFile[] = [];
  const createdFiles: QnAFile[] = [];
  qnaFilesNeedMigrate.forEach((file) => {
    const { id, content } = file;
    const qnaSectionStartLine = file.qnaSections[0].range?.start.line || 0;
    const originQnAFileContent = substringTextByLine(content, 0, qnaSectionStartLine - 1);
    const manualContainerContent = substringTextByLine(content, qnaSectionStartLine - 1);
    let originQnAFile = qnaUtil.parse(id, originQnAFileContent);

    const manualContainerFileId = `${getBaseName(id)}-manual.source`;
    const manualContainerFullFileId = `${manualContainerFileId}.qna`;

    // if container file not be imported, do import
    if (!originQnAFile.imports.find(({ id }) => manualContainerFullFileId === id)) {
      originQnAFile = qnaUtil.addImport(originQnAFile, manualContainerFullFileId);
    }
    updateFile(projectId, `${originQnAFile.id}.qna`, originQnAFile.content);
    updatedFiles.push(originQnAFile);

    // if container file not exist, create it. if exist, update it
    const originManualContainerFile = qnaFiles.find((item) => item.id === manualContainerFileId);
    if (originManualContainerFile) {
      const updatedContent = originManualContainerFile.content + '\n' + manualContainerContent;
      const updatedFile = qnaUtil.parse(manualContainerFileId, updatedContent);
      updateFile(projectId, `${updatedFile.id}.qna`, updatedFile.content);
      updatedFiles.push(updatedFile);
    } else {
      const createdFile = qnaUtil.parse(manualContainerFileId, manualContainerContent);
      createFile(projectId, `${createdFile.id}.qna`, createdFile.content);
      createdFiles.push(createdFile);
    }
  });

  const newQnAfiles: QnAFile[] = qnaFiles.map((file) => {
    const updated = updatedFiles.find((item) => item.id === file.id);
    return updated || file;
  });
  newQnAfiles.push(...createdFiles);
  return newQnAfiles;
};

export const copyQnAFilesOnOtherLocales = (
  projectId: string,
  dialogIds: string[],
  qnaFiles: QnAFile[],
  locales: string[]
): QnAFile[] => {
  const originalSourceQnAFiles = qnaFiles.filter((f) => f.id.endsWith('.source'));
  const containerQnAFileIds = dialogIds.map((d) => `${d}.en-us`);
  const containerKbFiles = qnaFiles.filter((f) => containerQnAFileIds.includes(f.id));
  const createdFiles: QnAFile[] = [];
  for (let i = 0; i < originalSourceQnAFiles.length; i++) {
    //source.{locale}.qna
    const newSourceQnAFileIds = locales.map((l) => `${originalSourceQnAFiles[i].id}.${l}`);
    const createdFile = qnaUtil.parse('dummyId', originalSourceQnAFiles[i].content);
    for (let j = 0; j < newSourceQnAFileIds.length; j++) {
      if (!qnaFiles.find((f) => f.id === newSourceQnAFileIds[j])) {
        createFile(projectId, `${newSourceQnAFileIds[j]}.qna`, createdFile.content);
        createdFiles.push({
          ...createdFile,
          id: newSourceQnAFileIds[j],
        });
      }
    }
    deleteFile(projectId, `${originalSourceQnAFiles[i].id}.qna`);
  }

  for (let i = 0; i < containerKbFiles.length; i++) {
    //source.{locale}.qna
    const newContainerKbFileIds = locales.map((l) => `${getBaseName(containerKbFiles[i].id)}.${l}`);
    const createdFile = qnaUtil.parse('dummyId', containerKbFiles[i].content);
    for (let j = 0; j < newContainerKbFileIds.length; j++) {
      if (!qnaFiles.find((f) => f.id === newContainerKbFileIds[j])) {
        createFile(projectId, `${newContainerKbFileIds[j]}.qna`, createdFile.content);
        createdFiles.push({
          ...createdFile,
          id: newContainerKbFileIds[j],
        });
      }
    }
  }
  qnaFiles.push(...createdFiles);
  return qnaFiles.filter((f) => !f.id.endsWith('.source'));
};

//migrate first and second version of qna files to the lastest design
export const migrateQnAFiles = (
  projectId: string,
  dialogIds: string[],
  qnaFiles: QnAFile[],
  locales: string[]
): QnAFile[] => {
  // migrate script move qna pairs in *.qna to *-manual.source.qna.
  const updateQnAFiles1 = reformQnAToContainerKB(projectId, qnaFiles, locales);
  // copy qna file on other locales including  *-manual.source.qna
  const updateQnAFiles2 = copyQnAFilesOnOtherLocales(projectId, dialogIds, updateQnAFiles1, locales);

  return updateQnAFiles2;
};

export const getQnAFileUrlOption = (file: QnAFile): string | undefined => {
  return file.options.find((opt) => opt.name === 'url')?.value;
};

export const getQnAFileMultiTurnOption = (file: QnAFile): boolean | undefined => {
  return file.options.find((opt) => opt.name === 'multiTurn')?.value === 'true';
};

export const isQnAFileCreatedFromUrl = (file: QnAFile): boolean => {
  return getQnAFileUrlOption(file) ? true : false;
};
