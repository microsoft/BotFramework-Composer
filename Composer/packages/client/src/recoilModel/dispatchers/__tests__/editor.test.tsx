// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilState, useRecoilValue } from 'recoil';

import { editorDispatcher } from '../editor';
import { renderRecoilHook, act } from '../../../../__tests__/testUtils';
import { visualEditorSelectionState, clipboardActionsState } from '../../atoms';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';

describe('<Editor />', () => {
  let renderedComponent;
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

    renderedComponent = renderRecoilHook(useRecoilTestHook, {
      states: [
        { recoilState: visualEditorSelectionState, initialValue: [] },
        { recoilState: clipboardActionsState, initialValue: [{ action1: 'hi123' }] },
      ],
      dispatcher: {
        recoilState: dispatcherState,
        initialValue: {
          editorDispatcher,
        },
      },
    });
  });

  it('should set clipboard state correctly', () => {
    act(() => {
      renderedComponent.result.current.currentDispatcher.setVisualEditorClipboard([{ action2: 'hi' }]);
    });
    expect(renderedComponent.result.current.clipboardState).toEqual([{ action2: 'hi' }]);
  });
});
