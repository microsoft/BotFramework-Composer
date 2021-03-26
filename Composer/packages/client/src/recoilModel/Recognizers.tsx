// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogInfo, LuFile, QnAFile, SDKKinds, RecognizerFile, LuProviderType } from '@bfc/shared';
import React, { useEffect, useRef } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRecoilValue } from 'recoil';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';

import { getBaseName, getExtension } from '../utils/fileUtil';
import { getLuProvider } from '../utils/dialogUtil';

import * as luUtil from './../utils/luUtil';
import * as buildUtil from './../utils/buildUtil';
import { crossTrainConfigState, filePersistenceState, luFilesState, qnaFilesState, settingsState } from './atoms';
import { dialogsSelectorFamily } from './selectors';
import { recognizersSelectorFamily } from './selectors/recognizers';

export const LuisRecognizerTemplate = (target: string, fileName: string) => ({
  $kind: SDKKinds.LuisRecognizer,
  id: `LUIS_${target}`,
  applicationId: `=settings.luis.${fileName.replace(/[.-]/g, '_')}_lu.appId`,
  version: `=settings.luis.${fileName.replace(/[.-]/g, '_')}_lu.version`,
  endpoint: '=settings.luis.endpoint',
  endpointKey: '=settings.luis.endpointKey',
});

export const QnAMakerRecognizerTemplate = (target: string, fileName: string) => ({
  $kind: SDKKinds.QnAMakerRecognizer,
  id: `QnA_${target}`,
  knowledgeBaseId: `=settings.qna.${fileName.replace(/[.-]/g, '_')}_qna`,
  hostname: '=settings.qna.hostname',
  endpointKey: '=settings.qna.endpointKey',
});

export const MultiLanguageRecognizerTemplate = (target: string, key: 'LUIS' | 'QnA' | 'ORCHESTRATOR') => ({
  $kind: SDKKinds.MultiLanguageRecognizer,
  id: `${key}_${target}`,
  recognizers: {},
});

export const CrossTrainedRecognizerTemplate = (): {
  $kind: SDKKinds.CrossTrainedRecognizerSet;
  recognizers: string[];
} => ({
  $kind: SDKKinds.CrossTrainedRecognizerSet,
  recognizers: [],
});

export const OrchestratorRecognizerTemplate = (target: string, fileName: string) => {
  let locale: string = fileName.split('.')?.[1]?.toLowerCase() ?? 'en';
  locale = locale.startsWith('en') ? 'en' : 'multilang';

  return {
    $kind: SDKKinds.OrchestratorRecognizer,
    modelFolder: `=settings.orchestrator.models.${locale}`,
    snapshotFile: `=settings.orchestrator.snapshots.${fileName.replace(/[.-]/g, '_')}`,
  };
};

export const getMultiLanguagueRecognizerDialog = (
  target: string,
  files: { empty: boolean; id: string }[],
  fileType: 'lu' | 'qna',
  isOrchestrator = false,
  defaultLanguage = 'en-us'
) => {
  const key = fileType === 'qna' ? 'QnA' : isOrchestrator ? 'ORCHESTRATOR' : 'LUIS';

  const multiLanguageRecognizer = MultiLanguageRecognizerTemplate(target, key);

  files.forEach((item) => {
    if (item.empty || getBaseName(item.id) !== target) return;
    const locale = getExtension(item.id);
    const fileName = `${item.id}.${fileType}`;
    multiLanguageRecognizer.recognizers[locale] = fileName;
    if (locale === defaultLanguage) {
      multiLanguageRecognizer.recognizers[''] = fileName;
    }
  });

  return { id: `${target}.${fileType}.dialog`, content: multiLanguageRecognizer };
};

export const getLuisRecognizerDialogs = (target: string, luFiles: LuFile[]) => {
  return luFiles
    .filter((item) => getBaseName(item.id) === target)
    .map((item) => ({ id: `${item.id}.lu.dialog`, content: LuisRecognizerTemplate(target, item.id) }));
};

export const getOrchestratorRecognizerDialogs = (target: string, luFiles: LuFile[]) => {
  return luFiles
    .filter((item) => getBaseName(item.id) === target)
    .map((item) => ({ id: `${item.id}.lu.dialog`, content: OrchestratorRecognizerTemplate(target, item.id) }));
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

export const generateRecognizers = (
  dialog: DialogInfo,
  luFiles: LuFile[],
  qnaFiles: QnAFile[],
  luProvide?: LuProviderType
) => {
  const isCrossTrain = isCrossTrainedRecognizerSet(dialog);
  const isOrchestrator = luProvide === SDKKinds.OrchestratorRecognizer;
  const luisRecognizers = isOrchestrator
    ? getOrchestratorRecognizerDialogs(dialog.id, luFiles)
    : getLuisRecognizerDialogs(dialog.id, luFiles);
  const luMultiLanguageRecognizer = getMultiLanguagueRecognizerDialog(dialog.id, luFiles, 'lu', isOrchestrator);

  const crossTrainedRecognizer = getCrossTrainedRecognizerDialog(dialog.id, luFiles, qnaFiles);
  const qnaMultiLanguagueRecognizer = getMultiLanguagueRecognizerDialog(dialog.id, qnaFiles, 'qna');
  const qnaMakeRecognizers = getQnAMakerRecognizerDialogs(dialog.id, qnaFiles);

  return {
    isCrossTrain,
    luisRecognizers,
    luMultiLanguageRecognizer,
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
  const curRecognizers = useRecoilValue(recognizersSelectorFamily(projectId));
  const curRecognizersRef = useRef(curRecognizers);
  const filePersistence = useRecoilValue(filePersistenceState(projectId));
  curRecognizersRef.current = curRecognizers;

  useEffect(() => {
    if (isEmpty(filePersistence)) return;
    let recognizers: RecognizerFile[] = [];

    dialogs
      .filter((dialog) => isCrossTrainedRecognizerSet(dialog) || isLuisRecognizer(dialog))
      .forEach((dialog) => {
        const luProvide = getLuProvider(dialog.id, curRecognizersRef.current);
        const filteredLus = luFiles.filter((item) => getBaseName(item.id) === dialog.id);
        const filteredQnas = qnaFiles.filter((item) => getBaseName(item.id) === dialog.id);
        const {
          isCrossTrain,
          luisRecognizers,
          luMultiLanguageRecognizer,
          crossTrainedRecognizer,
          qnaMultiLanguagueRecognizer,
          qnaMakeRecognizers,
        } = generateRecognizers(dialog, filteredLus, filteredQnas, luProvide);

        if (luisRecognizers.length) {
          recognizers.push(luMultiLanguageRecognizer);
          recognizers = [...recognizers, ...preserveRecognizer(luisRecognizers, curRecognizersRef.current)];
        }
        if (isCrossTrain) {
          recognizers.push(crossTrainedRecognizer);
        }
        if (isCrossTrain && qnaMakeRecognizers.length) {
          recognizers.push(qnaMultiLanguagueRecognizer);
          recognizers = [...recognizers, ...preserveRecognizer(qnaMakeRecognizers, curRecognizersRef.current)];
        }
      });
    if (!isEqual([...recognizers].sort(), [...curRecognizersRef.current].sort())) {
      setRecognizers(recognizers);
    }
  }, [dialogs, luFiles, qnaFiles, filePersistence]);

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
