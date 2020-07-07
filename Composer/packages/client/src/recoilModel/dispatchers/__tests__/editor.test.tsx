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
        { recoilState: visualEditorSelectionState, initialValue: ['test'] },
        { recoilState: clipboardActionsState, initialValue: [] },
      ],
      dispatcher: {
        recoilState: dispatcherState,
        initialValue: {
          editorDispatcher,
        },
      },
    });
  });

  it('should set visual editor clipboard', () => {
    act(() => {
      renderedComponent.result.current.currentDispatcher.setVisualEditorClipboard([{ test: 'hi' }]);
    });
    expect(renderedComponent.result.current.clipboardState).toEqual([{ test: 'hi' }]);
  });
});
