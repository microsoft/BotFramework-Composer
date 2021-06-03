// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useMemo } from 'react';
import { EditorExtension, PluginConfig } from '@bfc/extension-client';
import { useRecoilValue } from 'recoil';
import { useSetRecoilState } from 'recoil';

import { useShell } from '../../shell';
import { useElectronFeatures } from '../../hooks/useElectronFeatures';
import {
  visualEditorSelectionState,
  projectMetaDataState,
  triggerModalInfoState,
  currentDialogState,
} from '../../recoilModel';
import { undoStatusSelectorFamily } from '../../recoilModel/selectors/undo';

import { VisualEditor } from './VisualEditor';

type VisualEditorWrapperProps = {
  projectId: string;
  dialogId?: string;
  pluginConfig: PluginConfig;
};

const VisualEditorWrapper: React.FC<VisualEditorWrapperProps> = React.memo(({ projectId, dialogId, pluginConfig }) => {
  const currentDialog = useRecoilValue(currentDialogState({ dialogId, projectId }));
  const visualEditorSelection = useRecoilValue(visualEditorSelectionState);
  const [canUndo, canRedo] = useRecoilValue(undoStatusSelectorFamily(projectId));
  const { isRemote: isRemoteSkill } = useRecoilValue(projectMetaDataState(projectId));

  const setTriggerModalInfo = useSetRecoilState(triggerModalInfoState);

  const shellForFlowEditor = useShell('FlowEditor', projectId);

  const openNewTriggerModal = (projectId: string, dialogId: string) => {
    setTriggerModalInfo({ projectId, dialogId });
  };

  const { actionSelected } = useMemo(() => {
    const actionSelected = Array.isArray(visualEditorSelection) && visualEditorSelection.length > 0;

    return { actionSelected };
  }, [visualEditorSelection, currentDialog?.content]);

  const { onFocusFlowEditor, onBlurFlowEditor } = useElectronFeatures(actionSelected, canUndo, canRedo);

  return (
    <EditorExtension plugins={pluginConfig} projectId={projectId} shell={shellForFlowEditor}>
      <VisualEditor
        isRemoteSkill={isRemoteSkill}
        openNewTriggerModal={() => {
          if (!dialogId) return;
          openNewTriggerModal(projectId, dialogId);
        }}
        onBlur={() => onBlurFlowEditor()}
        onFocus={() => onFocusFlowEditor()}
      />
    </EditorExtension>
  );
});

export default VisualEditorWrapper;
