// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import Path from 'path';

import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { CreateOptions } from '../../components/CreationFlow/CreateOptions';
import { OpenProject } from '../../components/CreationFlow/OpenProject';
import DefineConversation from '../../components/CreationFlow/DefineConversation';
import {
  dispatcherState,
  creationFlowStatusState,
  storagesState,
  focusedStorageFolderState,
  creationFlowTypeState,
  userSettingsState,
  templateProjectsState,
} from '../../recoilModel';
import { CreationFlowStatus } from '../../constants';
import TelemetryClient from '../../telemetry/TelemetryClient';

interface CreationModalProps {
  onSubmit: () => void;
  onDismiss?: () => void;
}

export const CreationModal: React.FC<CreationModalProps> = (props) => {
  const {
    fetchStorages,
    fetchTemplates,
    fetchFolderItemsByPath,
    setCreationFlowStatus,
    createFolder,
    updateCurrentPathForStorage,
    updateFolder,
    saveTemplateId,
    createNewBot,
    openProject,
    addNewSkillToBotProject,
    addExistingSkillToBotProject,
  } = useRecoilValue(dispatcherState);

  const templateProjects = useRecoilValue(templateProjectsState);
  const creationFlowStatus = useRecoilValue(creationFlowStatusState);
  const creationFlowType = useRecoilValue(creationFlowTypeState);
  const focusedStorageFolder = useRecoilValue(focusedStorageFolderState);
  const { appLocale } = useRecoilValue(userSettingsState);
  const storages = useRecoilValue(storagesState);
  const currentStorageIndex = useRef(0);
  const storage = storages[currentStorageIndex.current];
  const currentStorageId = storage ? storage.id : 'default';
  const [templateId, setTemplateId] = useState('');

  useEffect(() => {
    if (storages?.length) {
      const storageId = storage.id;
      const path = storage.path;
      const formattedPath = Path.normalize(path);
      fetchFolderItemsByPath(storageId, formattedPath);
    }
  }, [storages]);

  const fetchResources = async () => {
    await fetchStorages();
    fetchTemplates();
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const updateCurrentPath = async (newPath, storageId) => {
    if (!storageId) {
      storageId = currentStorageId;
    }
    if (newPath) {
      const formattedPath = Path.normalize(newPath);
      updateCurrentPathForStorage(formattedPath, storageId);
    }
  };

  const handleCreateNew = async (formData, templateId: string) => {
    const newBotData = {
      templateId: templateId || '',
      name: formData.name,
      description: formData.description,
      location: formData.location,
      schemaUrl: formData.schemaUrl,
      appLocale,
    };
    if (creationFlowType === 'Skill') {
      addNewSkillToBotProject(newBotData);
      TelemetryClient.track('AddNewSkillCompleted');
    } else {
      createNewBot(newBotData);
    }
  };

  const handleDismiss = () => {
    setCreationFlowStatus(CreationFlowStatus.CLOSE);
    props.onDismiss?.();
  };

  const handleDefineConversationSubmit = async (formData, templateId: string) => {
    // If selected template is vaCore then route to VA Customization modal
    if (templateId === 'va-core') {
      return;
    }

    handleSubmit(formData, templateId);
  };

  const handleSubmit = async (formData, templateId: string) => {
    handleDismiss();
    saveTemplateId(templateId);
    await handleCreateNew(formData, templateId);
  };

  const handleCreateNext = async (templateId: string) => {
    setCreationFlowStatus(CreationFlowStatus.NEW_FROM_TEMPLATE);
    setTemplateId(templateId);
  };

  const openBot = async (botFolder) => {
    handleDismiss();
    if (creationFlowType === 'Skill') {
      addExistingSkillToBotProject(botFolder);
      TelemetryClient.track('AddNewSkillCompleted');
    } else {
      openProject(botFolder);
    }
  };

  return (
    <Fragment>
      {creationFlowStatus === CreationFlowStatus.NEW_FROM_TEMPLATE ? (
        <DefineConversation
          createFolder={createFolder}
          focusedStorageFolder={focusedStorageFolder}
          templateId={templateId}
          updateFolder={updateFolder}
          onCurrentPathUpdate={updateCurrentPath}
          onDismiss={handleDismiss}
          onSubmit={handleDefineConversationSubmit}
        />
      ) : null}

      {creationFlowStatus === CreationFlowStatus.NEW ? (
        <CreateOptions templates={templateProjects} onDismiss={handleDismiss} onNext={handleCreateNext} />
      ) : null}

      {creationFlowStatus === CreationFlowStatus.OPEN ? (
        <OpenProject
          focusedStorageFolder={focusedStorageFolder}
          onCurrentPathUpdate={updateCurrentPath}
          onDismiss={handleDismiss}
          onOpen={openBot}
        />
      ) : null}
    </Fragment>
  );
};

export default CreationModal;
