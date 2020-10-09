// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Loadable,
  RecoilState,
  Snapshot,
  useGotoRecoilSnapshot,
  useRecoilSnapshot,
  // eslint-disable-next-line @typescript-eslint/camelcase
  useRecoilTransactionObserver_UNSTABLE,
} from 'recoil';
import * as React from 'react';
import { AtomMap, History } from 'src/undo/types';

const getAtomMap = (snapshot: Snapshot, trackedAtoms: RecoilState<any>[]): AtomMap => {
  const atomMap = new Map<RecoilState<any>, Loadable<any>>();
  for (const atom of trackedAtoms) {
    atomMap.set(atom, snapshot.getLoadable(atom));
  }
  return atomMap;
};

const didAtomMapsChange = (prevMap: AtomMap, currMap: AtomMap) => {
  for (const key of prevMap.keys()) {
    if (!currMap.has(key)) {
      return true;
    }

    const prevVal = prevMap.get(key);
    const currVal = currMap.get(key);

    if (prevVal && currVal) {
      if (prevVal.state !== currVal.state) {
        return true;
      }

      if (prevVal.state === 'hasValue' && currVal.state === 'hasValue' && prevVal.contents !== currVal.contents) {
        return true;
      }
    }
  }

  return false;
};

const mapTrackedAtomsOntoSnapshot = (
  current: Snapshot,
  target: Snapshot,
  trackedAtoms: RecoilState<any>[] | null | undefined
): Snapshot => {
  if (!trackedAtoms) {
    return target;
  }

  const atomMap = getAtomMap(target, trackedAtoms);

  return current.map((pendingSnap) => {
    for (const [atom, loadable] of atomMap.entries()) {
      if (loadable.state === 'hasValue') {
        pendingSnap.set(atom, loadable.contents);
      }
    }
  });
};

type ContextState = {
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
};

export const UndoContext = React.createContext<ContextState>({
  undo: () => {},
  redo: () => {},
  canUndo: () => false,
  canRedo: () => false,
});

type Props = React.PropsWithChildren<{ trackedAtoms?: RecoilState<any>[] }>;

export const UndoRoot = React.memo(({ trackedAtoms, children }: Props) => {
  const currentSnapshot = useRecoilSnapshot();

  const isUndoingRef = React.useRef(false);

  const { 0: history, 1: setHistory } = React.useState<History>({
    past: [],
    present: { snapshot: currentSnapshot, trackedAtoms },
    future: [],
  });

  const gotoSnapshot = useGotoRecoilSnapshot();

  useRecoilTransactionObserver_UNSTABLE(({ snapshot, previousSnapshot }) => {
    if (isUndoingRef.current) {
      isUndoingRef.current = false;
      return;
    }

    if (trackedAtoms) {
      const prevMap = getAtomMap(previousSnapshot, trackedAtoms);
      const currMap = getAtomMap(snapshot, trackedAtoms);

      if (!didAtomMapsChange(prevMap, currMap)) {
        setHistory({ ...history, present: { snapshot, trackedAtoms } });
        return;
      }
    }

    setHistory({
      past: [...history.past, { snapshot: previousSnapshot, trackedAtoms }],
      present: { snapshot, trackedAtoms },
      future: [],
    });
  });

  const undo = React.useCallback(() => {
    setHistory((history: History) => {
      if (!history.past.length) {
        return history;
      }

      isUndoingRef.current = true;
      const target = history.past[history.past.length - 1];
      const { present } = history;
      const newPresent = mapTrackedAtomsOntoSnapshot(present.snapshot, target.snapshot, target.trackedAtoms);

      gotoSnapshot(newPresent);

      return {
        past: history.past.slice(0, history.past.length - 1),
        present: { snapshot: newPresent, trackedAtoms },
        future: [history.present, ...history.future],
      };
    });
  }, [setHistory, gotoSnapshot, trackedAtoms]);

  const redo = React.useCallback(() => {
    setHistory((history: History) => {
      if (!history.future.length) {
        return history;
      }

      isUndoingRef.current = true;
      const target = history.future[0];
      const { present } = history;
      const newPresent = mapTrackedAtomsOntoSnapshot(present.snapshot, target.snapshot, target.trackedAtoms);
      gotoSnapshot(newPresent);

      return {
        past: [...history.past, history.present],
        present: { snapshot: newPresent, trackedAtoms },
        future: history.future.slice(1),
      };
    });
  }, [setHistory, gotoSnapshot, trackedAtoms]);

  const canUndo = React.useCallback(() => history.past.length > 1, [history.past]);

  const canRedo = React.useCallback(() => !!history.future.length, [history.future]);

  const contextValue = React.useMemo(() => ({ undo, redo, canUndo, canRedo }), [undo, redo, canUndo, canRedo]);

  return <UndoContext.Provider value={contextValue}>{children}</UndoContext.Provider>;
});
