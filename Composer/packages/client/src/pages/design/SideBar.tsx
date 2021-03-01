// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { Diagnostic } from '@bfc/shared';
import { useRecoilValue } from 'recoil';
import { OpenConfirmModal, dialogStyle } from '@bfc/ui-shared';
import { useSetRecoilState } from 'recoil';
import React from 'react';

import { DialogDeleting, removeSkillDialog } from '../../constants';
import { createSelectedPath, deleteTrigger as DialogdeleteTrigger } from '../../utils/dialogUtil';
import { ProjectTree } from '../../components/ProjectTree/ProjectTree';
import { navigateTo, createBotSettingUrl } from '../../utils/navigation';
import {
  dispatcherState,
  dialogsSelectorFamily,
  projectDialogsMapSelector,
  designPageLocationState,
  triggerModalInfoState,
  brokenSkillInfoState,
  dialogModalInfoState,
  showAddSkillDialogModalState,
  rootBotProjectIdSelector,
  currentDialogState,
  skillUsedInBotsSelector,
} from '../../recoilModel';
import { undoFunctionState } from '../../recoilModel/undo/history';
import { decodeDesignerPathToArrayPath } from '../../utils/convertUtils/designerPathEncoder';
import { CreationFlowStatus } from '../../constants';
import { useBotOperations } from '../../components/BotRuntimeController/useBotOperations';
import { exportSkillModalInfoState } from '../../recoilModel/atoms/appState';
import TelemetryClient from '../../telemetry/TelemetryClient';
import { TreeLink } from '../../components/ProjectTree/types';

import { deleteDialogContent, removeSkillDialogContentStyle, removeSkillDialogStyle } from './styles';

function onRenderContent(subTitle, style) {
  return (
    <div css={deleteDialogContent}>
      <p>{DialogDeleting.CONTENT}</p>
      {subTitle && <div style={style}>{subTitle}</div>}
      <p>{DialogDeleting.CONFIRM_CONTENT}</p>
    </div>
  );
}

function getAllRef(targetId, dialogs) {
  let refs: string[] = [];
  dialogs.forEach((dialog) => {
    if (dialog.id === targetId) {
      refs = refs.concat(dialog.referredDialogs);
    } else if (!dialog.referredDialogs.every((item) => item !== targetId)) {
      refs.push(dialog.displayName || dialog.id);
    }
  });
  return refs;
}

const parseTriggerId = (triggerId: string | undefined): number | undefined => {
  if (triggerId == null) return undefined;
  const indexString = triggerId.match(/\d+/)?.[0];
  if (indexString == null) return undefined;
  return parseInt(indexString);
};

type SideBarProps = { projectId: string };

const SideBar: React.FC<SideBarProps> = React.memo(({ projectId }) => {
  const { dialogId, selected: encodedSelected } = useRecoilValue(designPageLocationState(projectId));
  const currentDialog = useRecoilValue(currentDialogState({ dialogId, projectId }));
  const dialogs = useRecoilValue(dialogsSelectorFamily(projectId));
  const projectDialogsMap = useRecoilValue(projectDialogsMapSelector);
  const { startSingleBot, stopSingleBot } = useBotOperations();
  const undoFunction = useRecoilValue(undoFunctionState(projectId));
  const rootProjectId = useRecoilValue(rootBotProjectIdSelector);
  const { commitChanges } = undoFunction;

  const {
    removeDialog,
    updateDialog,
    createDialogBegin,
    navTo,
    selectTo,
    exportToZip,
    setCreationFlowStatus,
    setCreationFlowType,
    removeSkillFromBotProject,
    updateZoomRate,
    deleteTrigger,
  } = useRecoilValue(dispatcherState);
  const skillUsedInBotsMap = useRecoilValue(skillUsedInBotsSelector);
  const selected = decodeDesignerPathToArrayPath(
    dialogs.find((x) => x.id === dialogId)?.content,
    encodedSelected || ''
  );

  const setTriggerModalInfo = useSetRecoilState(triggerModalInfoState);

  const setDialogModalInfo = useSetRecoilState(dialogModalInfoState);
  const setExportSkillModalInfo = useSetRecoilState(exportSkillModalInfoState);
  const setBrokenSkillInfo = useSetRecoilState(brokenSkillInfoState);
  const setAddSkillDialogModalVisibility = useSetRecoilState(showAddSkillDialogModalState);

  function handleSelect(destination: TreeLink) {
    if (destination.botError) {
      setBrokenSkillInfo(destination);
    }
    const {
      skillId: targetSkillId,
      dialogId: targetDialogId,
      trigger: targetTrigger,
      projectId: targetProjectId,
    } = destination;

    updateZoomRate({ currentRate: 1 });

    if (targetTrigger != null) {
      selectTo(targetSkillId ?? null, targetDialogId ?? null, `triggers[${targetTrigger}]`);
    } else if (targetDialogId != null) {
      navTo(targetSkillId ?? targetProjectId, targetDialogId);
    } else {
      // with no dialog or ID, we must be looking at a bot link
      navTo(targetSkillId ?? targetProjectId, null);
    }
  }

  const onCreateDialogComplete = (targetProjectId: string) => (targetDialogId: string) => {
    if (targetDialogId) {
      navTo(targetProjectId, targetDialogId);
    }
  };

  const projectTreeHeaderMenuItems = [
    {
      key: 'CreateNewSkill',
      label: formatMessage('Create a new skill'),
      onClick: () => {
        setCreationFlowType('Skill');
        setCreationFlowStatus(CreationFlowStatus.NEW);
        TelemetryClient.track('AddNewSkillStarted', { method: 'newSkill' });
      },
    },
    {
      key: 'OpenSkill',
      label: formatMessage('Open an existing skill'),
      onClick: () => {
        setCreationFlowType('Skill');
        setCreationFlowStatus(CreationFlowStatus.OPEN);
        TelemetryClient.track('AddNewSkillStarted', { method: 'existingSkill' });
      },
    },
    {
      key: 'ConnectRemoteSkill',
      label: formatMessage('Connect a remote skill'),
      onClick: () => {
        setAddSkillDialogModalVisibility(true);
        TelemetryClient.track('AddNewSkillStarted', { method: 'remoteSkill' });
      },
    },
  ];

  async function handleDeleteDialog(projectId: string, dialogId: string) {
    const refs = getAllRef(dialogId, dialogs);
    let setting: Record<string, string | ((subTitle: string, style: any) => JSX.Element)> = {
      confirmBtnText: formatMessage('Yes'),
      cancelBtnText: formatMessage('Cancel'),
    };
    let title = '';
    let subTitle = '';
    if (refs.length > 0) {
      title = DialogDeleting.TITLE;
      subTitle = `${refs.reduce((result, item) => `${result} ${item} \n`, '')}`;
      setting = {
        onRenderContent,
        style: dialogStyle.console,
      };
    } else {
      title = DialogDeleting.NO_LINKED_TITLE;
    }
    const result = await OpenConfirmModal(title, subTitle, setting);

    if (result) {
      await removeDialog(dialogId, projectId);
      commitChanges();
    }
  }

  async function handleDeleteTrigger(projectId: string, dialogId: string, index: number) {
    const content = DialogdeleteTrigger(
      projectDialogsMap[projectId],
      dialogId,
      index,
      async (trigger) => await deleteTrigger(projectId, dialogId, trigger)
    );

    if (content) {
      await updateDialog({ id: dialogId, content, projectId });
      const match = /\[(\d+)\]/g.exec(selected);
      const current = match?.[1];
      if (!current) {
        commitChanges();
        return;
      }
      const currentIdx = parseInt(current);
      if (index === currentIdx) {
        if (currentIdx - 1 >= 0) {
          //if the deleted node is selected and the selected one is not the first one, navTo the previous trigger;
          await selectTo(projectId, dialogId, createSelectedPath(currentIdx - 1));
        } else {
          //if the deleted node is selected and the selected one is the first one, navTo the first trigger;
          await navTo(projectId, dialogId);
        }
      } else if (index < currentIdx) {
        //if the deleted node is at the front, navTo the current one;
        await selectTo(projectId, dialogId, createSelectedPath(currentIdx - 1));
      }

      commitChanges();
    }
  }

  const handleCreateDialog = (projectId: string) => {
    createDialogBegin([], onCreateDialogComplete(projectId), projectId);
    setDialogModalInfo(projectId);
  };

  const handleDisplayManifestModal = (currentProjectId: string) => {
    setExportSkillModalInfo(currentProjectId);
  };

  const handleErrorClick = (projectId: string, skillId: string, diagnostic: Diagnostic) => {
    switch (diagnostic.source) {
      case 'appsettings.json': {
        navigateTo(createBotSettingUrl(projectId, skillId, diagnostic.path));
        break;
      }
      case 'manifest.json': {
        setExportSkillModalInfo(skillId || projectId);
      }
    }
  };

  async function handleRemoveSkill(skillId: string) {
    // check if skill used in current project workspace
    const usedInBots = skillUsedInBotsMap[skillId];
    const confirmRemove = usedInBots.length
      ? await OpenConfirmModal(formatMessage('Warning'), removeSkillDialog().subText, {
          onRenderContent: () => {
            return (
              <div css={removeSkillDialogStyle}>
                <div> {removeSkillDialog().subText} </div>
                <div css={removeSkillDialogContentStyle}> {usedInBots.map(({ name }) => name).join('\n')} </div>
                <div> {removeSkillDialog().footerText} </div>
              </div>
            );
          },
        })
      : await OpenConfirmModal(formatMessage('Warning'), removeSkillDialog().subTextNoUse);

    if (!confirmRemove) return;
    removeSkillFromBotProject(skillId);
  }

  const selectedTrigger = currentDialog?.triggers.find((t) => t.id === selected);

  return (
    <ProjectTree
      headerAriaLabel={formatMessage('Filter by dialog or trigger name')}
      headerMenu={projectTreeHeaderMenuItems}
      headerPlaceholder={formatMessage('Filter by dialog or trigger name')}
      selectedLink={{
        projectId: rootProjectId,
        skillId: rootProjectId === projectId ? undefined : projectId,
        dialogId,
        trigger: parseTriggerId(selectedTrigger?.id),
      }}
      onBotCreateDialog={handleCreateDialog}
      onBotDeleteDialog={handleDeleteDialog}
      onBotEditManifest={handleDisplayManifestModal}
      onBotExportZip={exportToZip}
      onBotRemoveSkill={handleRemoveSkill}
      onBotStart={startSingleBot}
      onBotStop={stopSingleBot}
      onDialogCreateTrigger={(projectId, dialogId) => {
        setTriggerModalInfo({ projectId, dialogId });
      }}
      onDialogDeleteTrigger={handleDeleteTrigger}
      onErrorClick={handleErrorClick}
      onSelect={handleSelect}
    />
  );
});

export default SideBar;
