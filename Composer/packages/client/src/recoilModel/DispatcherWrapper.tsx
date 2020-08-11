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
  dialogsState,
  dialogSchemasState,
  projectIdState,
  luFilesState,
  skillManifestsState,
  settingsState,
  lgFilesState,
  formDialogSchemasState,
} from './atoms';
import { UndoRoot } from './undo/history';

const getBotAssets = async (snapshot: Snapshot): Promise<BotAssets> => {
  const result = await Promise.all([
    snapshot.getPromise(projectIdState),
    snapshot.getPromise(dialogsState),
    snapshot.getPromise(luFilesState),
    snapshot.getPromise(lgFilesState),
    snapshot.getPromise(skillManifestsState),
    snapshot.getPromise(settingsState),
    snapshot.getPromise(dialogSchemasState),
    snapshot.getPromise(formDialogSchemasState),
  ]);
  return {
    projectId: result[0],
    dialogs: result[1],
    luFiles: result[2],
    lgFiles: result[3],
    skillManifests: result[4],
    setting: result[5],
    dialogSchemas: result[6],
    formDialogSchemas: result[7],
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
    const assets = await getBotAssets(snapshot);
    const previousAssets = await getBotAssets(previousSnapshot);
    filePersistence.notify(assets, previousAssets);
  });

  return (
    <Fragment>
      <UndoRoot />
      <InitDispatcher onLoad={setLoaded} />
      {loaded ? children : null}
    </Fragment>
  );
};
