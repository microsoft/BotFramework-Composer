// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { renderHook } from '@bfc/test-utils/lib/hooks';

import { useEditorEventApi } from '../../../src/adaptive-flow-editor/hooks/useEditorEventApi';
import { ShellApiStub } from '../stubs/ShellApiStub';
import { defaultRendererContextValue } from '../../../src/adaptive-flow-editor/contexts/NodeRendererContext';
import { defaultSelectionContextValue } from '../../../src/adaptive-flow-editor/contexts/SelectionContext';
import { NodeEventTypes } from '../../../src/adaptive-flow-renderer/constants/NodeEventTypes';

describe('useSelectionEffect', () => {
  const hook = renderHook(() =>
    useEditorEventApi(
      {
        path: '',
        data: {},
        nodeContext: { ...defaultRendererContextValue, focusedId: 'a' },
        selectionContext: { ...defaultSelectionContextValue, selectedIds: ['a'] },
      },
      ShellApiStub
    )
  ).result.current;

  it('returns necessary apis.', () => {
    expect(hook.handleEditorEvent).toBeTruthy();
  });

  it('can handle events.', () => {
    const { handleEditorEvent } = hook;

    handleEditorEvent('event.view.focus' as NodeEventTypes, {});
    handleEditorEvent('event.view.ctrl-click' as NodeEventTypes, {});
    handleEditorEvent('event.view.shift-click' as NodeEventTypes, {});
    handleEditorEvent('event.view.focus-event' as NodeEventTypes, {});
    handleEditorEvent('event.view.move-cursor' as NodeEventTypes, {});
    handleEditorEvent('event.nav.opendialog' as NodeEventTypes, {});
    handleEditorEvent('event.data.delete' as NodeEventTypes, {});
    handleEditorEvent('event.data.insert' as NodeEventTypes, {});
    handleEditorEvent('event.data.copy-selection' as NodeEventTypes, {});
    handleEditorEvent('event.data.cut-selection' as NodeEventTypes, {});
    handleEditorEvent('event.data.paste-selection' as NodeEventTypes, {});
    handleEditorEvent('event.data.move-selection' as NodeEventTypes, {});
    handleEditorEvent('event.data.delete-selection' as NodeEventTypes, {});
    handleEditorEvent('event.data.paste-selection--keyboard' as NodeEventTypes, {});
    handleEditorEvent('event.data.paste-selection--menu' as NodeEventTypes, {});
    handleEditorEvent('event.operation.undo' as NodeEventTypes, {});
    handleEditorEvent('event.operation.redo' as NodeEventTypes, {});
  });
});
