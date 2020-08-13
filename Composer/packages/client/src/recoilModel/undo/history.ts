// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  useRecoilTransactionObserver_UNSTABLE as useRecoilTransactionObserver,
  RecoilState,
  useRecoilValue,
} from 'recoil';
import { atom, Snapshot, useRecoilCallback, CallbackInterface, useSetRecoilState } from 'recoil';
import uniqueId from 'lodash/uniqueId';

import { navigateTo, getUrlSearch } from '../../utils/navigation';

import { breadcrumbState, projectsMetaDataState } from './../atoms/botState';
import { designPageLocationState, currentProjectIdState, botProjectsState } from './../atoms';
import undoHistory, { UndoHistory } from './undoHistory';
import { trackedAtoms, AtomAssetsMap } from './trackedAtoms';

export const undoFunctionState = atom({
  key: 'undoFunction',
  default: {
    undo: () => {},
    redo: () => {},
    canUndo: (): boolean => false,
    canRedo: (): boolean => false,
    commitChanges: () => {},
    clearUndo: () => {},
  },
});

export const undoVersionState = atom({
  key: 'version',
  default: '',
});

const getAtomAssetsMap = (snap: Snapshot): AtomAssetsMap => {
  const atomMap = new Map<RecoilState<any>, any>();
  trackedAtoms.forEach((atom) => {
    const loadable = snap.getLoadable(atom);
    atomMap.set(atom, loadable.state === 'hasValue' ? loadable.contents : null);
  });

  //should record the location state
  atomMap.set(designPageLocationState, snap.getLoadable(designPageLocationState).contents);
  atomMap.set(currentProjectIdState, snap.getLoadable(currentProjectIdState).contents);
  atomMap.set(breadcrumbState, snap.getLoadable(breadcrumbState).contents);
  return atomMap;
};

const checkAtomChanged = (current: AtomAssetsMap, previous: AtomAssetsMap, atom: RecoilState<any>) => {
  const currVal = current.get(atom);
  const prevVal = previous.get(atom);

  if (prevVal !== currVal) {
    return true;
  }

  return false;
};

const checkAtomsChanged = (current: AtomAssetsMap, previous: AtomAssetsMap, atoms: RecoilState<any>[]) => {
  return atoms.some((atom) => checkAtomChanged(current, previous, atom));
};

function navigate(next: AtomAssetsMap, projectId: string) {
  const location = next.get(designPageLocationState(projectId));
  const breadcrumb = [...next.get(breadcrumbState(projectId))];
  if (location) {
    const { dialogId, selected, focused, projectId, promptTab } = location;
    let currentUri = `/bot/${projectId}/dialogs/${dialogId}${getUrlSearch(selected, focused)}`;
    if (promptTab) {
      currentUri += `#${promptTab}`;
    }
    breadcrumb.pop();
    navigateTo(currentUri, { state: { breadcrumb } });
  }
}

function mapTrackedAtomsOntoSnapshot(
  target: Snapshot,
  currentAssets: AtomAssetsMap,
  nextAssets: AtomAssetsMap,
  projectId: string
): Snapshot {
  trackedAtoms(projectId).forEach((atom) => {
    const current = currentAssets.get(atom);
    const next = nextAssets.get(atom);
    if (current !== next) {
      target = target.map(({ set }) => set(atom, next));
    }
  });
  return target;
}

function setInitialLocation(snapshot: Snapshot, projectId: string, undoHistory: UndoHistory) {
  const location = snapshot.getLoadable(designPageLocationState(projectId));
  const breadcrumb = snapshot.getLoadable(breadcrumbState(projectId));
  if (location.state === 'hasValue') {
    undoHistory.setInitialValue(designPageLocationState(projectId), location.contents);
    undoHistory.setInitialValue(breadcrumbState(projectId), breadcrumb.contents);
  }
}

export const UndoRoot = React.memo(() => {
  const history = useRef(undoHistory).current;
  const setUndoFunction = useSetRecoilState(undoFunctionState);
  const [, forceUpdate] = useState([]);
  const setVersion = useSetRecoilState(undoVersionState);
  const projectId = useRecoilValue(currentProjectIdState);

  //use to record the first time change, this will help to get the init location
  //init location is used to undo navigate
  const assetsChanged = useRef(false);

  useRecoilTransactionObserver(({ snapshot, previousSnapshot }) => {
    const currentAssets = getAtomAssetsMap(snapshot);
    const previousAssets = getAtomAssetsMap(previousSnapshot);
    const botProjects = snapshot.getLoadable(botProjectsState);
    const rootBotProjectId = botProjects[0];
    if (checkAtomChanged(currentAssets, previousAssets, projectsMetaDataState(rootBotProjectId))) {
      //switch project should clean the undo history when the root bot has been changed
      undoHistory.clear();
      undoHistory.add(getAtomAssetsMap(snapshot));
    } else if (!assetsChanged.current) {
      if (checkAtomsChanged(currentAssets, previousAssets, trackedAtoms(projectId))) {
        assetsChanged.current = true;
      }
      setInitialLocation(snapshot, projectId, history);
    }
  });

  const undoAssets = (
    target: Snapshot,
    current: AtomAssetsMap,
    next: AtomAssetsMap,
    gotoSnapshot: (snapshot: Snapshot) => void,
    projectId: string
  ) => {
    target = mapTrackedAtomsOntoSnapshot(target, current, next, projectId);
    gotoSnapshot(target);
    navigate(next, projectId);
  };

  const undo = useRecoilCallback(({ snapshot, gotoSnapshot }: CallbackInterface) => (projectId: string) => {
    if (history.canUndo()) {
      const present = history.getPresentAssets();
      const next = history.undo();
      if (present) undoAssets(snapshot, present, next, gotoSnapshot, projectId);
      setVersion(uniqueId());
    }
  });

  const redo = useRecoilCallback(({ snapshot, gotoSnapshot }: CallbackInterface) => (projectId: string) => {
    if (history.canRedo()) {
      const present = history.getPresentAssets();
      const next = history.redo();
      if (present) undoAssets(snapshot, present, next, gotoSnapshot, projectId);
      setVersion(uniqueId());
    }
  });

  const canUndo = () => {
    return history.canUndo();
  };

  const canRedo = () => {
    return history.canRedo();
  };

  const commit = useRecoilCallback(({ snapshot }) => () => {
    const currentAssets = getAtomAssetsMap(snapshot);
    const previousAssets = history.getPresentAssets();
    //filter some invalid changes
    if (previousAssets && checkAtomsChanged(currentAssets, previousAssets, trackedAtoms)) {
      history.add(getAtomAssetsMap(snapshot));
    }
  });

  const commitChanges = useCallback(() => {
    //gurarantee the snapshot get the latset state
    forceUpdate([]);
    commit();
  }, [commit]);

  const clearUndo = useRecoilCallback(({ snapshot }) => () => {
    history.clear();
    history.add(getAtomAssetsMap(snapshot));
    assetsChanged.current = false;
  });

  useEffect(() => {
    setUndoFunction({ undo, redo, canRedo, canUndo, commitChanges, clearUndo });
  });

  return null;
});
