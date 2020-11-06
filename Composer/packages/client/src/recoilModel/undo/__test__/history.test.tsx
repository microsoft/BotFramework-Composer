// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { act } from 'react-test-renderer';
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';

import { UndoRoot, undoFunctionState, undoHistoryState } from '../history';
import {
  lgFilesState,
  luFilesState,
  projectMetaDataState,
  currentProjectIdState,
  botProjectIdsState,
  designPageLocationState,
  canUndoState,
  canRedoState,
} from '../../atoms';
import { dialogsSelectorFamily } from '../../selectors';
import { renderRecoilHook } from '../../../../__tests__/testUtils/react-recoil-hooks-testing-library';
import UndoHistory from '../undoHistory';
import { undoStatusSelectorFamily } from '../../selectors/undo';
const projectId = '123-asd';

export const UndoRedoWrapper = () => {
  const botProjects = useRecoilValue(botProjectIdsState);

  return botProjects.length > 0 ? <UndoRoot projectId={projectId} /> : null;
};

describe('<UndoRoot/>', () => {
  let renderedComponent;

  beforeEach(() => {
    const useRecoilTestHook = () => {
      const { undo, redo, commitChanges, clearUndo } = useRecoilValue(undoFunctionState(projectId));
      const [dialogs, setDialogs] = useRecoilState(dialogsSelectorFamily(projectId));
      const setProjectIdState = useSetRecoilState(currentProjectIdState);
      const setDesignPageLocation = useSetRecoilState(designPageLocationState(projectId));
      const history = useRecoilValue(undoHistoryState(projectId));
      const [canUndo, canRedo] = useRecoilValue(undoStatusSelectorFamily(projectId));
      return {
        undo,
        redo,
        canRedo,
        canUndo,
        commitChanges,
        clearUndo,
        setProjectIdState,
        setDialogs,
        dialogs,
        history,
        setDesignPageLocation,
      };
    };

    const { result } = renderRecoilHook(useRecoilTestHook, {
      wrapper: ({ children }) => {
        return (
          <div>
            <UndoRedoWrapper />
            {children}
          </div>
        );
      },
      states: [
        { recoilState: botProjectIdsState, initialValue: [projectId] },
        { recoilState: dialogsSelectorFamily(projectId), initialValue: [{ id: '1', content: '' }] },
        { recoilState: lgFilesState(projectId), initialValue: [{ id: '1.lg' }, { id: '2' }] },
        { recoilState: luFilesState(projectId), initialValue: [{ id: '1.lu' }, { id: '2' }] },
        { recoilState: currentProjectIdState, initialValue: projectId },
        { recoilState: undoHistoryState(projectId), initialValue: new UndoHistory(projectId) },
        { recoilState: canUndoState(projectId), initialValue: false },
        { recoilState: canRedoState(projectId), initialValue: false },
        { recoilState: designPageLocationState(projectId), initialValue: { dialogId: '1', focused: '', selected: '' } },
        {
          recoilState: undoFunctionState(projectId),
          initialValue: {
            undo: jest.fn(),
            redo: jest.fn(),
            commitChanges: jest.fn(),
            clearUndo: jest.fn(),
          },
        },
        { recoilState: projectMetaDataState(projectId), initialValue: { isRootBot: true } },
      ],
    });
    renderedComponent = result;
  });

  // it('should add first snapshot', () => {
  //   expect(renderedComponent.current.history.stack.length).toBe(1);
  //   expect(renderedComponent.current.dialogs).toStrictEqual([{ id: '1' }]);
  // });

  it('should commit one change', () => {
    act(() => {
      renderedComponent.current.setDialogs([]);
    });
    act(() => {
      renderedComponent.current.commitChanges();
    });

    expect(renderedComponent.current.history.stack.length).toBe(2);
    expect(renderedComponent.current.dialogs).toStrictEqual([]);
  });

  it('should undo', () => {
    act(() => {
      renderedComponent.current.setDialogs([]);
    });
    act(() => {
      renderedComponent.current.commitChanges();
    });

    expect(renderedComponent.current.canUndo).toBeTruthy();

    act(() => {
      renderedComponent.current.undo();
    });
    expect(renderedComponent.current.history.stack.length).toBe(2);
    expect(renderedComponent.current.dialogs).toStrictEqual([{ id: '1', content: '' }]);
    expect(renderedComponent.current.canRedo).toBeTruthy();
  });

  it('should remove the items from present when commit a new change', () => {
    act(() => {
      renderedComponent.current.setDialogs([{ id: '2' }]);
    });

    act(() => {
      renderedComponent.current.commitChanges();
    });

    expect(renderedComponent.current.history.stack.length).toBe(2);
    expect(renderedComponent.current.dialogs).toStrictEqual([{ id: '2' }]);
  });

  it('should redo', () => {
    act(() => {
      renderedComponent.current.setDialogs([{ id: '2', content: '' }]);
    });

    act(() => {
      renderedComponent.current.setDesignPageLocation({ dialogId: '2' });
    });

    act(() => {
      renderedComponent.current.commitChanges();
    });
    expect(renderedComponent.current.canRedo).toBeFalsy();

    act(() => {
      renderedComponent.current.undo();
    });

    expect(renderedComponent.current.dialogs).toStrictEqual([{ id: '1', content: '' }]);
    expect(renderedComponent.current.canRedo).toBeTruthy();

    act(() => {
      renderedComponent.current.redo();
    });
    expect(renderedComponent.current.history.stack.length).toBe(2);
    expect(renderedComponent.current.dialogs).toStrictEqual([{ id: '2', content: '' }]);
  });

  it('should clear undo history', () => {
    act(() => {
      renderedComponent.current.clearUndo();
    });
    expect(renderedComponent.current.history.stack.length).toBe(1);
  });
});
