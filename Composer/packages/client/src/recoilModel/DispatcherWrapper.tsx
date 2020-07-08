// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRef, useEffect, useState, Fragment } from 'react';
// eslint-disable-next-line @typescript-eslint/camelcase
import { atom, useRecoilState, useRecoilTransactionObserver_UNSTABLE, Snapshot } from 'recoil';
import once from 'lodash/once';
import React from 'react';

import { prepareAxios } from './../utils/auth';
import filePersistence from './persistence/FilePersistence';
import createDispatchers, { Dispatcher } from './dispatchers';
import { dialogsState, projectIdState, luFilesState, skillManifestsState, settingsState, lgFilesState } from './atoms';
import { BotAssets } from './types';

const getBotAssets = async (snapshot: Snapshot): Promise<BotAssets> => {
  const result = await Promise.all([
    snapshot.getPromise(projectIdState),
    snapshot.getPromise(dialogsState),
    snapshot.getPromise(luFilesState),
    snapshot.getPromise(lgFilesState),
    snapshot.getPromise(skillManifestsState),
    snapshot.getPromise(settingsState),
  ]);
  return {
    projectId: result[0],
    dialogs: result[1],
    luFiles: result[2],
    lgFiles: result[3],
    skillManifests: result[4],
    setting: result[5],
  };
};

export const dispatcherState = atom<Dispatcher>({
  key: 'dispatcherState',
  default: {} as Dispatcher,
});

export const DispatcherWrapper = ({ children }) => {
  const [init, setInit] = useState(false);
  const prepareAxiosWithRecoil = once(prepareAxios);

  // Use a ref to ensure the dispatcher is only created once
  const dispatcherRef = useRef(createDispatchers());

  const [currentDispatcherState, setDispatcher] = useRecoilState(dispatcherState);

  useRecoilTransactionObserver_UNSTABLE(async ({ snapshot, previousSnapshot }) => {
    const assets = await getBotAssets(snapshot);
    const previousAssets = await getBotAssets(previousSnapshot);
    filePersistence.notify(assets, previousAssets);
  });

  console.log('test');
  useEffect(() => {
    setDispatcher(dispatcherRef.current);
    prepareAxiosWithRecoil(currentDispatcherState);
    setInit(true);
  }, []);

  return <Fragment>{init ? children : null}</Fragment>;
};
