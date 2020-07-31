// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useRef } from 'react';
import { useRecoilTransactionObserver_UNSTABLE as useRecoilTransactionObserver, useRecoilState } from 'recoil';
import { atom, Snapshot, useRecoilCallback, CallbackInterface, Loadable, useSetRecoilState } from 'recoil';

import { projectIdState } from '../atoms';

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
    startBatch: () => {},
    endBatch: () => {},
  },
});

const isUndoingState = atom({
  key: 'isUndoing',
  default: false,
});

const getAssets = (snap: Snapshot): Loadable<any>[] => {
  return trackedAtoms.map((state) => snap.getLoadable(state));
};

const checkAssetsChange = (snapshot: Snapshot, previousSnapshot: Snapshot) => {
  const prev = getAssets(previousSnapshot);
  const curr = getAssets(snapshot);

  for (const index in curr) {
    const prevVal = prev[index];
    const currVal = curr[index];

    if (prevVal.state !== currVal.state) {
      return true;
    }

    if (prevVal.state === 'hasValue' && currVal.state === 'hasValue' && prevVal.contents !== currVal.contents) {
      return true;
    }
  }

  return false;
};

const checkUndoing = (snapshot: Snapshot) => {
  const value = snapshot.getLoadable(isUndoingState);
  if (value.state === 'hasValue' && value.contents) return true;

  return false;
};

const checkUndoable = (snapshot: Snapshot, previousSnapshot: Snapshot, undoHistory: UndoHistory): boolean => {
  if (checkUndoing(snapshot)) return false;
  const currVal = snapshot.getLoadable(projectIdState);
  const prevVal = previousSnapshot.getLoadable(projectIdState);
  if (prevVal.state === 'hasError' || currVal.state === 'hasError') return false;
  if (currVal.state === 'hasValue' && !currVal.contents) return false;
  if (prevVal.state === 'hasValue' && currVal.state === 'hasValue' && prevVal.contents !== currVal.contents) {
    //switch project should clean the undo history
    undoHistory.clear();
    undoHistory.add(snapshot);
    return false;
  }

  return true;
};

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

export const UndoRoot = React.memo(() => {
  const history = useRef(undoHistory).current;
  const [isUndoing, setIsUndoing] = useRecoilState(isUndoingState);
  const isBatching = useRef(false);
  const setUndoFunction = useSetRecoilState(undoFunctionState);

  useRecoilTransactionObserver(({ snapshot, previousSnapshot }) => {
    if (!checkUndoable(snapshot, previousSnapshot, history)) return;

    if (checkAssetsChange(snapshot, previousSnapshot)) {
      if (isBatching.current) {
        history.replace(snapshot);
      } else {
        history.add(snapshot);
      }
    }
  });

  const undo = useRecoilCallback(({ snapshot, gotoSnapshot }: CallbackInterface) => () => {
    if (history.canUndo()) {
      snapshot = snapshot.map(({ set }) => set(isUndoingState, true));
      snapshot = mapTrackedAtomsOntoSnapshot(history.undo(), snapshot);
      gotoSnapshot(snapshot);
    }
  });

  const redo = useRecoilCallback(({ snapshot, gotoSnapshot }: CallbackInterface) => () => {
    if (history.canRedo()) {
      snapshot = snapshot.map(({ set }) => set(isUndoingState, true));
      snapshot = mapTrackedAtomsOntoSnapshot(history.redo(), snapshot);
      gotoSnapshot(snapshot);
    }
  });

  const canUndo = useRecoilCallback(() => () => {
    return history.canUndo();
  });

  const canRedo = useRecoilCallback(() => () => {
    return history.canRedo();
  });

  const startBatch = useRecoilCallback(() => () => {
    isBatching.current = true;
  });

  const endBatch = useRecoilCallback(() => () => {
    isBatching.current = false;
  });

  useEffect(() => {
    if (isUndoing) {
      setIsUndoing(false);
    }
  }, [isUndoing]);

  useEffect(() => {
    setUndoFunction({ undo, redo, canRedo, canUndo, startBatch, endBatch });
  }, []);

  return null;
});
