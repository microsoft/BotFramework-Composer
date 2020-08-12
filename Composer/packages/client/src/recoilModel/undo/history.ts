// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useRecoilTransactionObserver_UNSTABLE as useRecoilTransactionObserver, RecoilState } from 'recoil';
import { atom, Snapshot, useRecoilCallback, CallbackInterface, useSetRecoilState } from 'recoil';

import { projectIdState } from '../atoms';
import { navigateTo, getUrlSearch } from '../../utils/navigation';

import { designPageLocationState } from './../atoms/botState';
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

const getAtomAssetsMap = (snap: Snapshot): AtomAssetsMap => {
  const atomMap = new Map<RecoilState<any>, any>();
  trackedAtoms.forEach((atom) => {
    const loadable = snap.getLoadable(atom);
    atomMap.set(atom, loadable.state === 'hasValue' ? loadable.contents : null);
  });

  //should record the location state
  atomMap.set(designPageLocationState, snap.getLoadable(designPageLocationState).contents);
  atomMap.set(projectIdState, snap.getLoadable(projectIdState).contents);
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

function navigate(next: AtomAssetsMap, undoHistory: UndoHistory) {
  const location = next.get(designPageLocationState);
  if (location) {
    const { dialogId, selected, focused, projectId } =
      undoHistory.present === 0 ? undoHistory.initialLocation : location;
    const currentUri = `/bot/${projectId}/dialogs/${dialogId}${getUrlSearch(selected, focused)}`;
    navigateTo(currentUri);
  }
}

function mapTrackedAtomsOntoSnapshot(
  target: Snapshot,
  currentAssets: AtomAssetsMap,
  nextAssets: AtomAssetsMap
): Snapshot {
  trackedAtoms.forEach((atom) => {
    const current = currentAssets.get(atom);
    const next = nextAssets.get(atom);
    if (current !== next) {
      target = target.map(({ set }) => set(atom, next));
    }
  });
  return target;
}

function setInitialLocation(snapshot: Snapshot, undoHistory: UndoHistory) {
  const location = snapshot.getLoadable(designPageLocationState);
  if (location.state === 'hasValue') {
    undoHistory.setInitialLocation({ ...location.contents });
  }
}

export const UndoRoot = React.memo(() => {
  const history = useRef(undoHistory).current;
  const setUndoFunction = useSetRecoilState(undoFunctionState);
  const [, forceUpdate] = useState([]);
  //use to record the first time change, this will help to get the init location
  //init location is used to undo navigate
  const assetsChanged = useRef(false);

  useRecoilTransactionObserver(({ snapshot, previousSnapshot }) => {
    const currentAssets = getAtomAssetsMap(snapshot);
    const previousAssets = getAtomAssetsMap(previousSnapshot);
    if (checkAtomChanged(currentAssets, previousAssets, projectIdState)) {
      //switch project should clean the undo history
      undoHistory.clear();
      undoHistory.add(getAtomAssetsMap(snapshot));
    } else if (!assetsChanged.current) {
      if (checkAtomsChanged(currentAssets, previousAssets, trackedAtoms)) {
        assetsChanged.current = true;
      }
      setInitialLocation(snapshot, history);
    }
  });

  const undoAssets = (
    target: Snapshot,
    current: AtomAssetsMap,
    next: AtomAssetsMap,
    gotoSnapshot: (snapshot: Snapshot) => void
  ) => {
    target = mapTrackedAtomsOntoSnapshot(target, current, next);
    gotoSnapshot(target);
    navigate(next, history);
  };

  const undo = useRecoilCallback(({ snapshot, gotoSnapshot }: CallbackInterface) => () => {
    if (history.canUndo()) {
      const present = history.getPresentAssets();
      const next = history.undo();
      if (present) undoAssets(snapshot, present, next, gotoSnapshot);
    }
  });

  const redo = useRecoilCallback(({ snapshot, gotoSnapshot }: CallbackInterface) => () => {
    if (history.canRedo()) {
      const present = history.getPresentAssets();
      const next = history.redo();
      if (present) undoAssets(snapshot, present, next, gotoSnapshot);
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
