// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRef, useEffect, useState, Fragment } from 'react';
// eslint-disable-next-line @typescript-eslint/camelcase
import { atom, useRecoilTransactionObserver_UNSTABLE, Snapshot, useRecoilState } from 'recoil';
import once from 'lodash/once';
import React from 'react';
import { BotAssets } from '@bfc/shared';
import { useRecoilValue } from 'recoil';

import { prepareAxios } from './../utils/auth';
import filePersistence from './persistence/FilePersistence';
import createDispatchers, { Dispatcher } from './dispatchers';
import { currentProjectIdState, botProjectsState } from './atoms';
import { UndoRoot } from './undo/history';
import UndoHistory from './undo/undoHistory';
import { botStateByProjectIdSelector } from './selectors';

const getBotAssets = async (snapshot: Snapshot): Promise<BotAssets> => {
  const result = await Promise.all([
    snapshot.getPromise(currentProjectIdState),
    snapshot.getPromise(botStateByProjectIdSelector),
  ]);
  const { dialogs, luFiles, lgFiles, skillManifests, dialogSetting, dialogSchemas } = result[1];
  return {
    projectId: result[0],
    dialogs,
    luFiles,
    lgFiles,
    skillManifests,
    setting: dialogSetting,
    dialogSchemas,
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
  const botProjects = useRecoilValue(botProjectsState);

  useRecoilTransactionObserver_UNSTABLE(async ({ snapshot, previousSnapshot }) => {
    const assets = await getBotAssets(snapshot);
    const previousAssets = await getBotAssets(previousSnapshot);
    filePersistence.notify(assets, previousAssets);
  });

  return (
    <Fragment>
      {botProjects.map((projectId) => (
        <UndoRoot key={projectId} projectId={projectId} undoHistory={new UndoHistory()} />
      ))}
      <InitDispatcher onLoad={setLoaded} />
      {loaded ? children : null}
    </Fragment>
  );
};
