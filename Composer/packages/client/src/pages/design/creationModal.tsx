// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import Path from 'path';

import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { BotTemplate } from '@botframework-composer/types';
import { emptyBotNpmTemplateName } from '@bfc/shared';

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
import DefineConversation from '../../components/CreationFlow/DefineConversation';
import { CreateBot } from '../../components/CreationFlow/CreateBot';
import { AddBotModal } from '../../components/CreationFlow/AddBotModal';

interface CreationModalProps {
  onSubmit: () => void;
  onDismiss?: () => void;
}

export const CreationModal: React.FC<CreationModalProps> = (props) => {
  const {
    fetchStorages,
    fetchFolderItemsByPath,
    setCreationFlowStatus,
    createFolder,
    updateCurrentPathForStorage,
    updateFolder,
    saveTemplateId,
    createNewBot,
    openProject,
    addExistingSkillToBotProject,
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
  const [templateId, setTemplateId] = useState(emptyBotNpmTemplateName);

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
      isRoot: true,
    };
    if (creationFlowType === 'Skill') {
      const templateVersion = templateProjects.find((template: BotTemplate) => {
        return template.id == templateId;
      })?.package?.packageVersion;
      const newCreationBotData = {
        ...newBotData,
        templateVersion: templateVersion || '',
        schemaUrl: formData.schemaUrl,
        runtimeType: formData.runtimeType,
        runtimeLanguage: formData.runtimeLanguage,
        templateDir: formData?.pvaData?.templateDir,
        eTag: formData?.pvaData?.eTag,
        urlSuffix: formData?.pvaData?.urlSuffix,
        preserveRoot: formData?.pvaData?.preserveRoot,
        alias: formData?.alias,
        profile: formData?.profile,
        source: formData?.source,
        isRoot: false,
      };
      createNewBot(newCreationBotData);
    } else {
      createNewBot(newBotData);
    }
    TelemetryClient.track('AddNewSkillCompleted');
  };

  const handleDismiss = () => {
    setCreationFlowStatus(CreationFlowStatus.CLOSE);
    props.onDismiss?.();
  };

  const handleSubmit = async (formData, templateId: string) => {
    handleDismiss();
    saveTemplateId(templateId);
    await handleCreateNew(formData, templateId);
  };

  const handleDefineConversationSubmit = async (formData, templateId: string) => {
    handleSubmit(formData, templateId);
  };

  const handleCreateNext = async (templateId: string) => {
    setCreationFlowStatus(CreationFlowStatus.NEW_FROM_TEMPLATE);
    setTemplateId(templateId);
  };

  const openBot = async (botFolder) => {
    handleDismiss();
    if (creationFlowType === 'Skill') {
      addExistingSkillToBotProject(botFolder.path, botFolder.storage);
      TelemetryClient.track('AddNewSkillCompleted');
    } else {
      openProject(botFolder.path, botFolder.storage);
    }
  };

  const renderDefineConversation = () => {
    return (
      <DefineConversation
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
      <CreateBot
        isOpen
        fetchReadMe={fetchReadMe}
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

      {creationFlowStatus === CreationFlowStatus.NEW_SKILL ? <AddBotModal onDismiss={handleDismiss} /> : null}
    </Fragment>
  );
};

export default CreationModal;
