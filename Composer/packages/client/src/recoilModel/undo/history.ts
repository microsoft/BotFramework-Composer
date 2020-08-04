// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useRecoilTransactionObserver_UNSTABLE as useRecoilTransactionObserver, RecoilState } from 'recoil';
import { atom, Snapshot, useRecoilCallback, CallbackInterface, Loadable, useSetRecoilState } from 'recoil';

import { projectIdState } from '../atoms';
import { navigateTo, getUrlSearch } from '../../utils/navigation';

import { designPageLocationState } from './../atoms/botState';
import { UndoHistory } from './undoHistory';
import undoHistory from './undoHistory';
import { trackedAtoms } from './trackedAtoms';

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

const isUndoingState = atom({
  key: 'isUndoing',
  default: false,
});

const getAssets = (snap: Snapshot): Loadable<any>[] => {
  return trackedAtoms.map((state) => snap.getLoadable(state));
};

const checkAtomChanged = (snapshot: Snapshot, previousSnapshot: Snapshot, atom: RecoilState<any>) => {
  const currVal = snapshot.getLoadable(atom);
  const prevVal = previousSnapshot.getLoadable(atom);

  if (prevVal.state === 'hasValue' && currVal.state === 'hasValue' && prevVal.contents !== currVal.contents) {
    return true;
  }

  return false;
};

const checkAtomsChanged = (snapshot: Snapshot, previousSnapshot: Snapshot, atoms: RecoilState<any>[]) => {
  return atoms.some((atom) => checkAtomChanged(snapshot, previousSnapshot, atom));
};

function navigate(current: Snapshot, undoHistory: UndoHistory) {
  const location = current.getLoadable(designPageLocationState);
  const projectId = current.getLoadable(projectIdState);
  if (location.state === 'hasValue' && projectId.state === 'hasValue') {
    const { dialogId, selected, focused } = undoHistory.present === 0 ? undoHistory.initialLocation : location.contents;
    const currentUri = `/bot/${projectId.contents}/dialogs/${dialogId}${getUrlSearch(selected, focused)}`;
    navigateTo(currentUri);
  }
}

function mapTrackedAtomsOntoSnapshot(current: Snapshot, target: Snapshot): Snapshot {
  const assets = getAssets(current);
  trackedAtoms.forEach((atom, index) => {
    const loadable = assets[index];
    if (loadable.state === 'hasValue') {
      target = target.map(({ set }) => set(atom, loadable.contents));
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
  const assetsChanged = useRef(false);

  useRecoilTransactionObserver(({ snapshot, previousSnapshot }) => {
    if (checkAtomChanged(snapshot, previousSnapshot, projectIdState)) {
      //switch project should clean the undo history
      undoHistory.clear();
      undoHistory.add(snapshot);
    } else if (!assetsChanged.current) {
      if (checkAtomsChanged(snapshot, previousSnapshot, trackedAtoms)) {
        assetsChanged.current = true;
      }
      setInitialLocation(snapshot, history);
    }
  });

  const undoAssets = (target: Snapshot, current: Snapshot, gotoSnapshot: (snapshot: Snapshot) => void) => {
    target = target.map(({ set }) => set(isUndoingState, true));
    target = mapTrackedAtomsOntoSnapshot(current, target);
    gotoSnapshot(target);
    navigate(current, history);
  };

  const undo = useRecoilCallback(({ snapshot, gotoSnapshot }: CallbackInterface) => () => {
    if (history.canUndo()) {
      const current = history.undo();
      undoAssets(snapshot, current, gotoSnapshot);
    }
  });

  const redo = useRecoilCallback(({ snapshot, gotoSnapshot }: CallbackInterface) => () => {
    if (history.canRedo()) {
      const current = history.redo();
      undoAssets(snapshot, current, gotoSnapshot);
    }
  });

  const canUndo = () => {
    return history.canUndo();
  };

  const canRedo = () => {
    return history.canRedo();
  };

  const commit = useRecoilCallback(({ snapshot }) => () => {
    const previousSnapshot = history.getPresentSnapshot();
    if (previousSnapshot && checkAtomsChanged(snapshot, previousSnapshot, trackedAtoms)) {
      history.add(snapshot);
    }
  });

  const commitChanges = useCallback(() => {
    forceUpdate([]);
    commit();
  }, [commit]);

  const clearUndo = useRecoilCallback(({ snapshot }) => () => {
    history.clear();
    history.add(snapshot);
    assetsChanged.current = false;
  });

  useEffect(() => {
    setUndoFunction({ undo, redo, canRedo, canUndo, commitChanges, clearUndo });
  });

  return null;
});
