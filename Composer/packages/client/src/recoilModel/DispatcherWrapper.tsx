// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRef, useState, Fragment, useLayoutEffect, MutableRefObject } from 'react';
// eslint-disable-next-line @typescript-eslint/camelcase
import { atom, useRecoilTransactionObserver_UNSTABLE, Snapshot, useRecoilState } from 'recoil';
import once from 'lodash/once';
import React from 'react';
import { BotAssets } from '@bfc/shared';
import { useRecoilValue } from 'recoil';
import isEmpty from 'lodash/isEmpty';

import { dialogsSelectorFamily } from './selectors';
import { UndoRoot } from './undo/history';
import { prepareAxios } from './../utils/auth';
import createDispatchers, { Dispatcher } from './dispatchers';
import {
  luFilesState,
  qnaFilesState,
  skillManifestsState,
  dialogSchemasState,
  settingsState,
  filePersistenceState,
  botProjectFileState,
  jsonSchemaFilesState,
  crossTrainConfigState,
} from './atoms';
import { localBotsWithoutErrorsSelector, formDialogSchemasSelectorFamily } from './selectors';
import { Recognizer } from './Recognizers';
import { recognizersSelectorFamily } from './selectors/recognizers';
import { lgFilesSelectorFamily } from './selectors/lg';

const getBotAssets = async (projectId, snapshot: Snapshot): Promise<BotAssets> => {
  const dialogs = await snapshot.getPromise(dialogsSelectorFamily(projectId));
  const luFiles = await snapshot.getPromise(luFilesState(projectId));
  const lgFiles = await snapshot.getPromise(lgFilesSelectorFamily(projectId));
  const skillManifests = await snapshot.getPromise(skillManifestsState(projectId));
  const setting = await snapshot.getPromise(settingsState(projectId));
  const botProjectFile = await snapshot.getPromise(botProjectFileState(projectId));
  const dialogSchemas = await snapshot.getPromise(dialogSchemasState(projectId));
  const formDialogSchemas = await snapshot.getPromise(formDialogSchemasSelectorFamily(projectId));
  const jsonSchemaFiles = await snapshot.getPromise(jsonSchemaFilesState(projectId));
  const recognizers = await snapshot.getPromise(recognizersSelectorFamily(projectId));
  const crossTrainConfig = await snapshot.getPromise(crossTrainConfigState(projectId));
  const qnaFiles = await snapshot.getPromise(qnaFilesState(projectId));

  return {
    projectId,
    dialogs,
    luFiles,
    qnaFiles,
    lgFiles,
    skillManifests,
    setting,
    dialogSchemas,
    botProjectFile,
    formDialogSchemas,
    jsonSchemaFiles,
    recognizers,
    crossTrainConfig,
  };
};

export const dispatcherState = atom<Dispatcher>({
  key: 'dispatcherState',
  default: {} as Dispatcher,
});

const wrapDispatcher = (dispatchers, forceUpdate) => {
  return Object.keys(dispatchers).reduce((boundDispatchers, dispatcherName) => {
    const dispatcher = async (...args) => {
      forceUpdate([]); //guarantee the snapshot get the latest state
      await dispatchers[dispatcherName](...args);
    };
    boundDispatchers[dispatcherName] = dispatcher;
    return boundDispatchers;
  }, {} as Dispatcher);
};

const InitDispatcher = ({ onLoad }) => {
  const [, forceUpdate] = useState([]);
  const prepareAxiosWithRecoil = once(prepareAxios);

  // Use a ref to ensure the dispatcher is only created once
  const dispatcherRef: MutableRefObject<Dispatcher> = useRef(wrapDispatcher(createDispatchers(), forceUpdate));

  const [currentDispatcherState, setDispatcher] = useRecoilState(dispatcherState);

  //The render order is different with 0.0.10, the local state will trigger a render before atom value
  //so use the useLayoutEffect here
  useLayoutEffect(() => {
    setDispatcher(dispatcherRef.current);
    prepareAxiosWithRecoil(currentDispatcherState);
    onLoad(true);
  }, []);

  return null;
};

export const DispatcherWrapper = ({ children }) => {
  const [loaded, setLoaded] = useState(false);
  const botProjects = useRecoilValue(localBotsWithoutErrorsSelector);

  useRecoilTransactionObserver_UNSTABLE(async ({ snapshot, previousSnapshot }) => {
    const botsForFilePersistence = await snapshot.getPromise(localBotsWithoutErrorsSelector);
    const { setProjectError } = await snapshot.getPromise(dispatcherState);
    for (const projectId of botsForFilePersistence) {
      const assets = await getBotAssets(projectId, snapshot);
      const previousAssets = await getBotAssets(projectId, previousSnapshot);
      const filePersistence = await snapshot.getPromise(filePersistenceState(projectId));
      if (!isEmpty(filePersistence)) {
        if (filePersistence.isErrorHandlerEmpty()) {
          filePersistence.registerErrorHandler(setProjectError);
        }
        filePersistence.notify(assets, previousAssets);
      }
    }
  });

  return (
    <Fragment>
      {botProjects.map((projectId) => (
        <Fragment key={projectId}>
          <UndoRoot projectId={projectId} />
          <Recognizer projectId={projectId} />
        </Fragment>
      ))}
      <InitDispatcher onLoad={setLoaded} />
      {loaded ? children : null}
    </Fragment>
  );
};
