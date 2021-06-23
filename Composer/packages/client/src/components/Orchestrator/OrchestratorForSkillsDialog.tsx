// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogTypes, DialogWrapper } from '@bfc/ui-shared/lib/components/DialogWrapper';
import { SDKKinds } from '@botframework-composer/types';
import { Button } from 'office-ui-fabric-react/lib/components/Button/Button';
import React, { useMemo, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { enableOrchestratorDialog } from '../../constants';
import {
  designPageLocationState,
  dispatcherState,
  localeState,
  orchestratorForSkillsDialogState,
  rootBotProjectIdSelector,
  settingsState,
} from '../../recoilModel';
import { recognizersSelectorFamily } from '../../recoilModel/selectors/recognizers';
import { EnableOrchestrator } from '../AddRemoteSkillModal/EnableOrchestrator';
import { canImportOrchestrator } from '../AddRemoteSkillModal/helper';

export const OrchestratorForSkillsDialog = () => {
  const [showOrchestratorDialog, setShowOrchestratorDialog] = useRecoilState(orchestratorForSkillsDialogState);
  const rootProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const { dialogId } = useRecoilValue(designPageLocationState(rootProjectId));
  const locale = useRecoilValue(localeState(rootProjectId));
  const curRecognizers = useRecoilValue(recognizersSelectorFamily(rootProjectId));
  const setting = useRecoilValue(settingsState(rootProjectId));

  const { updateRecognizer } = useRecoilValue(dispatcherState);

  const hasOrchestrator = useMemo(() => {
    const fileName = `${dialogId}.${locale}.lu.dialog`;
    return curRecognizers.some((f) => f.id === fileName && f.content.$kind === SDKKinds.OrchestratorRecognizer);
  }, [curRecognizers, dialogId, locale]);

  useEffect(() => {
    if (showOrchestratorDialog && hasOrchestrator) {
      setShowOrchestratorDialog(false);
    }
  }, [hasOrchestrator, showOrchestratorDialog]);

  const handleOrchestratorSubmit = async (event: React.MouseEvent<HTMLElement | Button>, enable?: boolean) => {
    event.preventDefault();
    if (enable) {
      // update recognizor type to orchestrator
      await updateRecognizer(rootProjectId, dialogId, SDKKinds.OrchestratorRecognizer);
    }
    setShowOrchestratorDialog(false);
  };

  const onDismissHandler = (event: React.MouseEvent<HTMLButtonElement> | undefined) => {
    setShowOrchestratorDialog(false);
  };

  return (
    <DialogWrapper
      dialogType={DialogTypes.CreateFlow}
      isOpen={showOrchestratorDialog}
      title={enableOrchestratorDialog.title}
      onDismiss={onDismissHandler}
    >
      <EnableOrchestrator
        hideBackButton
        projectId={rootProjectId}
        runtime={setting?.runtime}
        onSubmit={handleOrchestratorSubmit}
      />
    </DialogWrapper>
  );
};
