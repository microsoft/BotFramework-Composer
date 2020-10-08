// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  useRecoilTransactionObserver_UNSTABLE as useRecoilTransactionObserver,
  RecoilState,
  useRecoilValue,
} from 'recoil';
import { atomFamily, Snapshot, useRecoilCallback, CallbackInterface, useSetRecoilState } from 'recoil';
import uniqueId from 'lodash/uniqueId';
import isEmpty from 'lodash/isEmpty';

import { navigateTo, getUrlSearch } from '../../utils/navigation';

import { breadcrumbState } from './../atoms/botState';
import { designPageLocationState } from './../atoms';
import { trackedAtoms, AtomAssetsMap } from './trackedAtoms';
import UndoHistory from './undoHistory';

type IUndoRedo = {
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  commitChanges: () => void;
  clearUndo: () => void;
};

export const undoFunctionState = atomFamily<IUndoRedo, string>({
  key: 'undoFunction',
  default: {} as IUndoRedo,
  dangerouslyAllowMutability: true,
});

export const undoHistoryState = atomFamily<UndoHistory, string>({
  key: 'undoHistory',
  default: {} as UndoHistory,
  dangerouslyAllowMutability: true,
});

export const undoVersionState = atomFamily({
  key: 'version',
  default: '',
  dangerouslyAllowMutability: true,
});

const getAtomAssetsMap = (snap: Snapshot, projectId: string): AtomAssetsMap => {
  const atomMap = new Map<RecoilState<any>, any>();
  const atomsToBeTracked = trackedAtoms(projectId);
  atomsToBeTracked.forEach((atom) => {
    const loadable = snap.getLoadable(atom);
    atomMap.set(atom, loadable.state === 'hasValue' ? loadable.contents : null);
  });

  //should record the location state
  atomMap.set(designPageLocationState(projectId), snap.getLoadable(designPageLocationState(projectId)).contents);
  atomMap.set(breadcrumbState(projectId), snap.getLoadable(breadcrumbState(projectId)).contents);
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
    const { dialogId, selected, focused, promptTab } = location;
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
interface UndoRootProps {
  projectId: string;
}

export const UndoRoot = React.memo((props: UndoRootProps) => {
  const { projectId } = props;
  const undoHistory = useRecoilValue(undoHistoryState(projectId));
  const history: UndoHistory = useRef(undoHistory).current;
  const [initialStateLoaded, setInitialStateLoaded] = useState(false);

  const setUndoFunction = useSetRecoilState(undoFunctionState(projectId));
  const [, forceUpdate] = useState([]);
  const setVersion = useSetRecoilState(undoVersionState(projectId));

  //use to record the first time change, this will help to get the init location
  //init location is used to undo navigate
  const assetsChanged = useRef(false);

  useRecoilTransactionObserver(({ snapshot, previousSnapshot }) => {
    if (initialStateLoaded && !assetsChanged.current) {
      const currentAssets = getAtomAssetsMap(snapshot, projectId);
      const previousAssets = getAtomAssetsMap(previousSnapshot, projectId);
      if (checkAtomsChanged(currentAssets, previousAssets, trackedAtoms(projectId))) {
        assetsChanged.current = true;
      }
      setInitialLocation(snapshot, projectId, history);
    }
  });

  const setInitialProjectState = useRecoilCallback(({ snapshot }: CallbackInterface) => () => {
    if (!isEmpty(undoHistory)) {
      undoHistory.clear();
      const assetMap = getAtomAssetsMap(snapshot, projectId);
      undoHistory.add(assetMap);
      setInitialStateLoaded(true);
    }
  });

  useEffect(() => {
    setInitialProjectState();
  }, []);

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

  const undo = useRecoilCallback(({ snapshot, gotoSnapshot }: CallbackInterface) => () => {
    if (history.canUndo()) {
      const present = history.getPresentAssets();
      const next = history.undo();
      if (present) undoAssets(snapshot, present, next, gotoSnapshot, projectId);
      setVersion(uniqueId());
    }
  });

  const redo = useRecoilCallback(({ snapshot, gotoSnapshot }: CallbackInterface) => () => {
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
    const currentAssets = getAtomAssetsMap(snapshot, projectId);
    const previousAssets = history.getPresentAssets();
    //filter some invalid changes

    if (previousAssets && checkAtomsChanged(currentAssets, previousAssets, trackedAtoms(projectId))) {
      history.add(getAtomAssetsMap(snapshot, projectId));
    }
  });

  const commitChanges = useCallback(() => {
    //gurarantee the snapshot get the latset state
    forceUpdate([]);
    commit();
  }, [commit]);

  const clearUndo = useRecoilCallback(({ snapshot }) => () => {
    history.clear();
    history.add(getAtomAssetsMap(snapshot, projectId));
    assetsChanged.current = false;
  });

  useEffect(() => {
    setUndoFunction({ undo, redo, canRedo, canUndo, commitChanges, clearUndo });
  }, []);

  return null;
});
