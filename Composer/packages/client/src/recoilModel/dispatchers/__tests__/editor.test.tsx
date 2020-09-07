// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilState, useRecoilValue } from 'recoil';
import { act } from '@bfc/test-utils/lib/hooks';

import { editorDispatcher } from '../editor';
import { renderRecoilHook } from '../../../../__tests__/testUtils';
import { visualEditorSelectionState, clipboardActionsState } from '../../atoms';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';
import { Dispatcher } from '..';

describe('Editor dispatcher', () => {
  let renderedComponent, dispatcher: Dispatcher;
  beforeEach(() => {
    const useRecoilTestHook = () => {
      const [visualEditorState, setVisualEditorState] = useRecoilState(visualEditorSelectionState);
      const [clipboardState, setClipboardActionsState] = useRecoilState(clipboardActionsState);
      const currentDispatcher = useRecoilValue(dispatcherState);

      return {
        clipboardState,
        visualEditorState,
        setVisualEditorState,
        setClipboardActionsState,
        currentDispatcher,
      };
    };

    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [
        { recoilState: visualEditorSelectionState, initialValue: [{ action1: 'initialVisualEditorValue' }] },
        { recoilState: clipboardActionsState, initialValue: [{ action1: 'initialClipboardVal' }] },
      ],
      dispatcher: {
        recoilState: dispatcherState,
        initialValue: {
          editorDispatcher,
        },
      },
    });
    renderedComponent = result;
    dispatcher = renderedComponent.current.currentDispatcher;
  });

  it('should set clipboard state correctly', () => {
    act(() => {
      dispatcher.setVisualEditorClipboard([{ action2: 'updatedVal' }]);
    });
    expect(renderedComponent.current.clipboardState).toEqual([{ action2: 'updatedVal' }]);
  });

  it('should set visual editor state', () => {
    act(() => {
      dispatcher.setVisualEditorSelection(['update1', 'update2']);
    });
    expect(renderedComponent.current.visualEditorState).toEqual(['update1', 'update2']);
  });

  it('should reset visual editor state', () => {
    act(() => {
      dispatcher.setVisualEditorSelection(['update1', 'update2']);
      dispatcher.resetVisualEditor();
    });
    expect(renderedComponent.current.visualEditorState).toEqual([]);
  });
});
