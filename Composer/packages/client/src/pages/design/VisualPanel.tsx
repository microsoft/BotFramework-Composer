// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect, useMemo, useState } from 'react';
import formatMessage from 'format-message';
import { JsonEditor } from '@bfc/code-editor';
import { PluginConfig } from '@bfc/extension-client';
import { useRecoilValue } from 'recoil';

import plugins, { mergePluginConfigs } from '../../plugins';
import {
  userSettingsState,
  dispatcherState,
  schemasState,
  projectMetaDataState,
  designPageLocationState,
  currentDialogState,
} from '../../recoilModel';
import { triggerNotSupported } from '../../utils/dialogValidator';
import { decodeDesignerPathToArrayPath } from '../../utils/convertUtils/designerPathEncoder';
import TelemetryClient from '../../telemetry/TelemetryClient';
import { LoadingSpinner } from '../../components/LoadingSpinner';

import { WarningMessage } from './WarningMessage';
import { visualPanel } from './styles';
import VisualPanelHeader from './VisualPanelHeader';
import VisualEditorWrapper from './VisualEditorWrapper';
import useAssetsParsingState from './useAssetsParsingState';

type VisualPanelProps = {
  projectId: string;
};

const VisualPanel: React.FC<VisualPanelProps> = React.memo(({ projectId }) => {
  const { dialogId, selected: encodedSelected } = useRecoilValue(designPageLocationState(projectId));
  const userSettings = useRecoilValue(userSettingsState);
  const currentDialog = useRecoilValue(currentDialogState({ dialogId, projectId }));
  const schemas = useRecoilValue(schemasState(projectId));
  const { isRemote: isRemoteSkill } = useRecoilValue(projectMetaDataState(projectId));
  const loading = useAssetsParsingState(projectId);
  const { updateDialog, navTo } = useRecoilValue(dispatcherState);

  const selected = decodeDesignerPathToArrayPath(currentDialog?.content, encodedSelected || '');

  const [dialogJsonVisible, setDialogJsonVisibility] = useState(false);
  const [warningIsVisible, setWarningIsVisible] = useState(true);

  useEffect(() => {
    if (!warningIsVisible) {
      setWarningIsVisible(true);
    }
  }, [dialogId, encodedSelected]);

  const pluginConfig: PluginConfig = useMemo(() => {
    const sdkUISchema = schemas?.ui?.content ?? {};
    const userUISchema = schemas?.uiOverrides?.content ?? {};
    return mergePluginConfigs({ uiSchema: sdkUISchema }, plugins, { uiSchema: userUISchema });
  }, [schemas?.ui?.content, schemas?.uiOverrides?.content]);

  const selectedTrigger = currentDialog?.triggers.find((t) => t.id === selected);
  const withWarning = triggerNotSupported(currentDialog, selectedTrigger);

  const handleShowCodeClick = () => {
    setDialogJsonVisibility((current) => !current);
    TelemetryClient.track('EditModeToggled', { jsonView: dialogJsonVisible });
  };

  return (
    <div aria-label={formatMessage('Authoring canvas')} css={visualPanel} role="region">
      {!isRemoteSkill && (
        <VisualPanelHeader
          pluginConfig={pluginConfig}
          projectId={projectId}
          showCode={dialogJsonVisible}
          onShowCodeClick={handleShowCodeClick}
        />
      )}

      {loading && <LoadingSpinner />}
      {!loading &&
        (dialogJsonVisible && currentDialog ? (
          <JsonEditor
            key={'dialogjson'}
            editorSettings={userSettings.codeEditor}
            id={currentDialog.id}
            schema={schemas.sdk.content}
            value={currentDialog.content || undefined}
            onChange={(data) => {
              updateDialog({ id: currentDialog.id, content: data, projectId });
            }}
          />
        ) : withWarning ? (
          <WarningMessage
            isVisible={warningIsVisible}
            okText={formatMessage('Change Recognizer')}
            onCancel={() => {
              setWarningIsVisible(false);
            }}
            onOk={() => navTo(projectId, dialogId ?? null)}
          />
        ) : (
          <VisualEditorWrapper dialogId={dialogId} pluginConfig={pluginConfig} projectId={projectId} />
        ))}
    </div>
  );
});

export default VisualPanel;
