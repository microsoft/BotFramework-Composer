// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useRef } from 'react';
import { act } from 'react-test-renderer';
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';

import { UndoRoot, undoFunctionState } from '../history';
import { dialogsState, lgFilesState, luFilesState, projectIdState } from '../../atoms';
import { renderRecoilHook } from '../../../../__tests__/testUtils/react-recoil-hooks-testing-library';
import undoHistory from '../undoHistory';

describe('<UndoRoot/>', () => {
  let renderedComponent;
  beforeEach(() => {
    const useRecoilTestHook = () => {
      const { undo, redo, canRedo, canUndo, commitChanges, clearUndo } = useRecoilValue(undoFunctionState);
      const [dialogs, setDialogs] = useRecoilState(dialogsState);
      const setProjectIdState = useSetRecoilState(projectIdState);
      const history = useRef(undoHistory).current;

      return {
        undo,
        redo,
        canRedo,
        canUndo,
        commitChanges,
        clearUndo,
        setProjectIdState,
        setDialogs,
        history,
        dialogs,
      };
    };

    const { result } = renderRecoilHook(useRecoilTestHook, {
      wrapper: ({ children }) => (
        <div>
          <UndoRoot />
          {children}
        </div>
      ),
      states: [
        { recoilState: dialogsState, initialValue: [{ id: '1' }] },
        { recoilState: lgFilesState, initialValue: [{ id: '1.lg' }, { id: '2' }] },
        { recoilState: luFilesState, initialValue: [{ id: '1.lu' }, { id: '2' }] },
        { recoilState: projectIdState, initialValue: '' },
        {
          recoilState: undoFunctionState,
          initialValue: {
            undo: jest.fn(),
            redo: jest.fn(),
            canUndo: jest.fn(),
            canRedo: jest.fn(),
            commitChanges: jest.fn(),
            clearUndo: jest.fn(),
          },
        },
      ],
    });
    renderedComponent = result;
  });

  it('should add first snapshot', () => {
    act(() => {
      renderedComponent.current.setProjectIdState('test');
    });

    expect(renderedComponent.current.history.stack.length).toBe(1);
    expect(renderedComponent.current.dialogs).toStrictEqual([{ id: '1' }]);
  });

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
