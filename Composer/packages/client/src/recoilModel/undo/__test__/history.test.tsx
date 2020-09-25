// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { act } from 'react-test-renderer';
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';

import { UndoRoot, undoFunctionState, undoHistoryState } from '../history';
import {
  dialogsState,
  lgFilesState,
  luFilesState,
  projectMetaDataState,
  currentProjectIdState,
  botProjectIdsState,
} from '../../atoms';
import { renderRecoilHook } from '../../../../__tests__/testUtils/react-recoil-hooks-testing-library';
import UndoHistory from '../undoHistory';
const projectId = '123-asd';

export const UndoRedoWrapper = () => {
  const botProjects = useRecoilValue(botProjectIdsState);

  return botProjects.length > 0 ? <UndoRoot projectId={projectId} /> : null;
};

describe('<UndoRoot/>', () => {
  let renderedComponent;

  beforeEach(() => {
    const useRecoilTestHook = () => {
      const { undo, redo, canRedo, canUndo, commitChanges, clearUndo } = useRecoilValue(undoFunctionState(projectId));
      const [dialogs, setDialogs] = useRecoilState(dialogsState(projectId));
      const setProjectIdState = useSetRecoilState(currentProjectIdState);
      const history = useRecoilValue(undoHistoryState(projectId));

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
        { recoilState: dialogsState(projectId), initialValue: [{ id: '1' }] },
        { recoilState: lgFilesState(projectId), initialValue: [{ id: '1.lg' }, { id: '2' }] },
        { recoilState: luFilesState(projectId), initialValue: [{ id: '1.lu' }, { id: '2' }] },
        { recoilState: currentProjectIdState, initialValue: projectId },
        { recoilState: undoHistoryState(projectId), initialValue: new UndoHistory(projectId) },
        {
          recoilState: undoFunctionState(projectId),
          initialValue: {
            undo: jest.fn(),
            redo: jest.fn(),
            canUndo: jest.fn(),
            canRedo: jest.fn(),
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

    expect(renderedComponent.current.canUndo()).toBeTruthy();

    act(() => {
      renderedComponent.current.undo();
    });
    expect(renderedComponent.current.history.stack.length).toBe(2);
    expect(renderedComponent.current.dialogs).toStrictEqual([{ id: '1' }]);
    expect(renderedComponent.current.canRedo()).toBeTruthy();
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
      renderedComponent.current.setDialogs([{ id: '2' }]);
    });
    act(() => {
      renderedComponent.current.commitChanges();
    });
    expect(renderedComponent.current.canRedo()).toBeFalsy();

    act(() => {
      renderedComponent.current.undo();
    });
    expect(renderedComponent.current.dialogs).toStrictEqual([{ id: '1' }]);
    expect(renderedComponent.current.canRedo()).toBeTruthy();

    act(() => {
      renderedComponent.current.redo();
    });
    expect(renderedComponent.current.history.stack.length).toBe(2);
    expect(renderedComponent.current.dialogs).toStrictEqual([{ id: '2' }]);
  });

  it('should clear undo history', () => {
    act(() => {
      renderedComponent.current.clearUndo();
    });
    expect(renderedComponent.current.history.stack.length).toBe(1);
  });
});
