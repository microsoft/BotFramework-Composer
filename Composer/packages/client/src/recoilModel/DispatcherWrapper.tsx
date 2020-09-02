// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRef, useEffect, useState, Fragment } from 'react';
// eslint-disable-next-line @typescript-eslint/camelcase
import { atom, useRecoilTransactionObserver_UNSTABLE, Snapshot, useRecoilState } from 'recoil';
import once from 'lodash/once';
import React from 'react';
import { BotAssets } from '@bfc/shared';

import { prepareAxios } from './../utils/auth';
import filePersistence from './persistence/FilePersistence';
import createDispatchers, { Dispatcher } from './dispatchers';
import {
  botProjectsState,
  dialogsState,
  luFilesState,
  qnaFilesState,
  lgFilesState,
  skillManifestsState,
  dialogSchemasState,
  settingsState,
} from './atoms';

const getBotAssets = async (projectId, snapshot: Snapshot): Promise<BotAssets> => {
  const result = await Promise.all([
    snapshot.getPromise(dialogsState(projectId)),
    snapshot.getPromise(luFilesState(projectId)),
    snapshot.getPromise(qnaFilesState(projectId)),
    snapshot.getPromise(lgFilesState(projectId)),
    snapshot.getPromise(skillManifestsState(projectId)),
    snapshot.getPromise(settingsState(projectId)),
    snapshot.getPromise(dialogSchemasState(projectId)),
  ]);
  return {
    projectId,
    dialogs: result[0],
    luFiles: result[1],
    qnaFiles: result[2],
    lgFiles: result[3],
    skillManifests: result[4],
    setting: result[5],
    dialogSchemas: result[6],
  };
};

export const dispatcherState = atom<Dispatcher>({
  key: 'dispatcherState',
  default: {} as Dispatcher,
});

const wrapDispatcher = (dispatchers, forceUpdate) => {
  return Object.keys(dispatchers).reduce((boundDispatchers, dispatcherName) => {
    const dispatcher = async (...args) => {
      forceUpdate([]); //gurarantee the snapshot get the latset state
      await dispatchers[dispatcherName](...args);
    };
    boundDispatchers[dispatcherName] = dispatcher;
    return boundDispatchers;
  }, {} as any);
};

const InitDispatcher = ({ onLoad }) => {
  const [, forceUpdate] = useState([]);
  const prepareAxiosWithRecoil = once(prepareAxios);

  // Use a ref to ensure the dispatcher is only created once
  const dispatcherRef = useRef(wrapDispatcher(createDispatchers(), forceUpdate));

  const [currentDispatcherState, setDispatcher] = useRecoilState(dispatcherState);

  useEffect(() => {
    setDispatcher(dispatcherRef.current);
    prepareAxiosWithRecoil(currentDispatcherState);
    onLoad(true);
  }, []);

  return null;
};

export const DispatcherWrapper = ({ children }) => {
  const [loaded, setLoaded] = useState(false);
  useRecoilTransactionObserver_UNSTABLE(async ({ snapshot, previousSnapshot }) => {
    const botProjects = await snapshot.getPromise(botProjectsState);
    for (const projectId of botProjects) {
      const assets = await getBotAssets(projectId, snapshot);
      const previousAssets = await getBotAssets(projectId, previousSnapshot);
      filePersistence.notify(assets, previousAssets);
    }
  });

  return (
    <Fragment>
      <InitDispatcher onLoad={setLoaded} />
      {loaded ? children : null}
    </Fragment>
  );
};
