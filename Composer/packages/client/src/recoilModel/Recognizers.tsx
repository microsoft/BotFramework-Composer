// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogInfo, LuFile, QnAFile, SDKKinds, RecognizerFile } from '@bfc/shared';
import React, { useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRecoilValue } from 'recoil';
import isEqual from 'lodash/isEqual';

import { getBaseName, getExtension } from '../utils/fileUtil';

import * as luUtil from './../utils/luUtil';
import * as buildUtil from './../utils/buildUtil';
import { crossTrainConfigState, luFilesState, qnaFilesState, settingsState } from './atoms';
import { dialogsSelectorFamily } from './selectors';
import { recognizersSelectorFamily } from './selectors/recognizers';

const LuisRecognizerTemplate = (target: string, fileName: string) => ({
  $kind: SDKKinds.LuisRecognizer,
  id: `LUIS_${target}`,
  applicationId: `=settings.luis.${fileName.replace(/[.-]/g, '_')}_lu.appId`,
  version: `=settings.luis.${fileName.replace(/[.-]/g, '_')}_lu.version`,
  endpoint: '=settings.luis.endpoint',
  endpointKey: '=settings.luis.endpointKey',
});

const QnAMakerRecognizerTemplate = (target: string, fileName: string) => ({
  $kind: SDKKinds.QnAMakerRecognizer,
  id: `QnA_${target}`,
  knowledgeBaseId: `=settings.qna.${fileName.replace(/[.-]/g, '_')}_qna`,
  hostname: '=settings.qna.hostname',
  endpointKey: '=settings.qna.endpointKey',
});

const MultiLanguageRecognizerTemplate = (target: string, fileType: 'lu' | 'qna') => ({
  $kind: SDKKinds.MultiLanguageRecognizer,
  id: `${fileType === 'lu' ? 'LUIS' : 'QnA'}_${target}`,
  recognizers: {},
});

const CrossTrainedRecognizerTemplate = (): {
  $kind: string;
  recognizers: string[];
} => ({
  $kind: SDKKinds.CrossTrainedRecognizerSet,
  recognizers: [],
});

export const getMultiLanguagueRecognizerDialog = (
  target: string,
  files: { empty: boolean; id: string }[],
  fileType: 'lu' | 'qna',
  defalutLanguage = 'en-us'
) => {
  const multiLanguageRecognizer = MultiLanguageRecognizerTemplate(target, fileType);

  files.forEach((item) => {
    if (item.empty || getBaseName(item.id) !== target) return;
    const locale = getExtension(item.id);
    const fileName = `${item.id}.${fileType}`;
    multiLanguageRecognizer.recognizers[locale] = fileName;
    if (locale === defalutLanguage) {
      multiLanguageRecognizer.recognizers[''] = fileName;
    }
  });

  return { id: `${target}.${fileType}.dialog`, content: multiLanguageRecognizer };
};

export const getLuisRecognizerDialogs = (target: string, luFiles: LuFile[]) => {
  return luFiles
    .filter((item) => !item.empty && getBaseName(item.id) === target)
    .map((item) => ({ id: `${item.id}.lu.dialog`, content: LuisRecognizerTemplate(target, item.id) }));
};

export const getQnAMakerRecognizerDialogs = (target: string, qnaFiles: QnAFile[]) => {
  return qnaFiles
    .filter((item) => !item.empty)
    .map((item) => ({ id: `${item.id}.qna.dialog`, content: QnAMakerRecognizerTemplate(target, item.id) }));
};

export const getCrossTrainedRecognizerDialog = (target: string, luFiles: LuFile[], qnaFiles: QnAFile[]) => {
  const crossTrainedRecognizer = CrossTrainedRecognizerTemplate();

  if (luFiles.some((item) => !item.empty)) {
    crossTrainedRecognizer.recognizers.push(`${target}.lu`);
  }

  if (qnaFiles.some((item) => !item.empty)) {
    crossTrainedRecognizer.recognizers.push(`${target}.qna`);
  }

  return {
    id: `${target}.lu.qna.dialog`,
    content: crossTrainedRecognizer,
  };
};

export const isCrossTrainedRecognizerSet = (dialog: DialogInfo) =>
  typeof dialog.content.recognizer === 'string' && dialog.content.recognizer.endsWith('qna');

export const isLuisRecognizer = (dialog: DialogInfo) =>
  typeof dialog.content.recognizer === 'string' && dialog.content.recognizer.endsWith('lu');

export const generateRecognizers = (dialog: DialogInfo, luFiles: LuFile[], qnaFiles: QnAFile[]) => {
  const isCrossTrain = isCrossTrainedRecognizerSet(dialog);
  const luisRecognizers = getLuisRecognizerDialogs(dialog.id, luFiles);
  const luMultiLanguagueRecognizer = getMultiLanguagueRecognizerDialog(dialog.id, luFiles, 'lu');

  const crossTrainedRecognizer = getCrossTrainedRecognizerDialog(dialog.id, luFiles, qnaFiles);
  const qnaMultiLanguagueRecognizer = getMultiLanguagueRecognizerDialog(dialog.id, qnaFiles, 'qna');
  const qnaMakeRecognizers = getQnAMakerRecognizerDialogs(dialog.id, qnaFiles);

  return {
    isCrossTrain,
    luisRecognizers,
    luMultiLanguagueRecognizer,
    crossTrainedRecognizer,
    qnaMultiLanguagueRecognizer,
    qnaMakeRecognizers,
  };
};

export const preserveRecognizer = (recognizers: { id: string; content: any }[], previousRecognizers: any[]) => {
  return recognizers.map((recognizer) => {
    const previous = previousRecognizers.find((item) => item.id === recognizer.id);
    if (previous) {
      recognizer.content = previous.content;
    }

    return recognizer;
  });
};

export const Recognizer = React.memo((props: { projectId: string }) => {
  const { projectId } = props;
  const setRecognizers = useSetRecoilState(recognizersSelectorFamily(projectId));
  const [crossTrainConfig, setCrossTrainConfig] = useRecoilState(crossTrainConfigState(projectId));
  const dialogs = useRecoilValue(dialogsSelectorFamily(projectId));
  const luFiles = useRecoilValue(luFilesState(projectId));
  const qnaFiles = useRecoilValue(qnaFilesState(projectId));
  const settings = useRecoilValue(settingsState(projectId));

  useEffect(() => {
    let recognizers: RecognizerFile[] = [];
    dialogs
      .filter((dialog) => !dialog.isFormDialog)
      .filter((dialog) => isCrossTrainedRecognizerSet(dialog) || isLuisRecognizer(dialog))
      .forEach((dialog) => {
        const filtedLus = luFiles.filter((item) => getBaseName(item.id) === dialog.id);
        const filtedQnas = qnaFiles.filter((item) => getBaseName(item.id) === dialog.id);
        const {
          isCrossTrain,
          luisRecognizers,
          luMultiLanguagueRecognizer,
          crossTrainedRecognizer,
          qnaMultiLanguagueRecognizer,
          qnaMakeRecognizers,
        } = generateRecognizers(dialog, filtedLus, filtedQnas);

        if (luisRecognizers.length) {
          recognizers.push(luMultiLanguagueRecognizer);
          recognizers = [...recognizers, ...preserveRecognizer(luisRecognizers, [])];
        }
        if (isCrossTrain) {
          recognizers.push(crossTrainedRecognizer);
        }
        if (isCrossTrain && qnaMakeRecognizers.length) {
          recognizers.push(qnaMultiLanguagueRecognizer);
          recognizers = [...recognizers, ...preserveRecognizer(qnaMakeRecognizers, [])];
        }
      });
    setRecognizers(recognizers);
  }, [dialogs, luFiles, qnaFiles]);

  useEffect(() => {
    try {
      const referredLuFiles = luUtil.checkLuisBuild(luFiles, dialogs);

      const curCrossTrainConfig = buildUtil.createCrossTrainConfig(dialogs, referredLuFiles, settings.languages);
      if (!isEqual(crossTrainConfig, curCrossTrainConfig)) {
        setCrossTrainConfig(curCrossTrainConfig);
      }
    } catch (error) {
      setCrossTrainConfig(crossTrainConfig);
    }
  }, [dialogs, luFiles, settings]);

  return null;
});
