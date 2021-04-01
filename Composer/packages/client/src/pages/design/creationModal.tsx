// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import Path from 'path';

import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { BotTemplate } from '@botframework-composer/types';

import { OpenProject } from '../../components/CreationFlow/OpenProject';
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
import DefineConversationV2 from '../../components/CreationFlow/v2/DefineConversation';
import { CreateBotV2 } from '../../components/CreationFlow/v2/CreateBot';

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
    createNewBotV2,
    openProject,
    addExistingSkillToBotProject,
    fetchTemplatesV2,
    fetchReadMe,
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
      const templateVersion = templateProjects.find((template: BotTemplate) => {
        return template.id == templateId;
      })?.package?.packageVersion;
      const newCreationBotData = {
        templateId: templateId || '',
        templateVersion: templateVersion || '',
        name: formData.name,
        description: formData.description,
        location: formData.location,
        schemaUrl: formData.schemaUrl,
        appLocale,
        templateDir: formData?.pvaData?.templateDir,
        eTag: formData?.pvaData?.eTag,
        urlSuffix: formData?.pvaData?.urlSuffix,
        preserveRoot: formData?.pvaData?.preserveRoot,
        alias: formData?.alias,
        profile: formData?.profile,
        source: formData?.source,
      };
      createNewBotV2(newCreationBotData);
    } else {
      createNewBot(newBotData);
    }
    TelemetryClient.track('AddNewSkillCompleted');
  };

  const handleDismiss = () => {
    setCreationFlowStatus(CreationFlowStatus.CLOSE);
    props.onDismiss?.();
  };

  const handleDefineConversationSubmit = async (formData, templateId: string) => {
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

  const renderDefineConversation = () => {
    return (
      <DefineConversationV2
        createFolder={createFolder}
        focusedStorageFolder={focusedStorageFolder}
        templateId={templateId}
        updateFolder={updateFolder}
        onCurrentPathUpdate={updateCurrentPath}
        onDismiss={handleDismiss}
        onSubmit={handleDefineConversationSubmit}
      />
    );
  };

  const renderCreateOptions = () => {
    return (
      <CreateBotV2
        isOpen
        fetchReadMe={fetchReadMe}
        fetchTemplates={fetchTemplatesV2}
        templates={templateProjects}
        onDismiss={handleDismiss}
        onNext={handleCreateNext}
      />
    );
  };

  return (
    <Fragment>
      {creationFlowStatus === CreationFlowStatus.NEW_FROM_TEMPLATE ? renderDefineConversation() : null}

      {creationFlowStatus === CreationFlowStatus.NEW ? renderCreateOptions() : null}

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
