// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// TODO: Remove path module
import Path from 'path';

import React, { useEffect, useRef, Fragment, useState } from 'react';
import { RouteComponentProps, Router, navigate } from '@reach/router';
import { useRecoilValue } from 'recoil';

import { CreationFlowStatus } from '../../constants';
import {
  dispatcherState,
  creationFlowStatusState,
  templateProjectsState,
  storagesState,
  focusedStorageFolderState,
  currentProjectIdState,
  userSettingsState,
} from '../../recoilModel';
import Home from '../../pages/home/Home';
import ImportQnAFromUrlModal from '../../pages/knowledge-base/ImportQnAFromUrlModal';
import { QnABotTemplateId } from '../../constants';
import { useProjectIdCache } from '../../utils/hooks';

import { CreateOptions } from './CreateOptions';
import { OpenProject } from './OpenProject';
import DefineConversation from './DefineConversation';

type CreationFlowProps = RouteComponentProps<{}>;

const CreationFlow: React.FC<CreationFlowProps> = () => {
  const {
    fetchTemplates,
    fetchStorages,
    fetchFolderItemsByPath,
    setCreationFlowStatus,
    createFolder,
    updateCurrentPathForStorage,
    updateFolder,
    saveTemplateId,
    fetchRecentProjects,
    openProject,
    createNewBot,
    saveProjectAs,
    fetchProjectById,
  } = useRecoilValue(dispatcherState);

  const creationFlowStatus = useRecoilValue(creationFlowStatusState);
  const projectId = useRecoilValue(currentProjectIdState);
  const templateProjects = useRecoilValue(templateProjectsState);
  const storages = useRecoilValue(storagesState);
  const focusedStorageFolder = useRecoilValue(focusedStorageFolderState);
  const { appLocale } = useRecoilValue(userSettingsState);
  const cachedProjectId = useProjectIdCache();
  const currentStorageIndex = useRef(0);
  const storage = storages[currentStorageIndex.current];
  const currentStorageId = storage ? storage.id : 'default';
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    if (storages && storages.length) {
      const storageId = storage.id;
      const path = storage.path;
      const formattedPath = Path.normalize(path);
      fetchFolderItemsByPath(storageId, formattedPath);
    }
  }, [storages]);

  const fetchResources = async () => {
    // fetchProject use `gotoSnapshot` which will wipe out all state value.
    // so here make those methods call in sequence.
    if (!projectId && cachedProjectId) {
      await fetchProjectById(cachedProjectId);
    }
    await fetchStorages();
    fetchTemplates();
    fetchRecentProjects();
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

  const handleDismiss = () => {
    setCreationFlowStatus(CreationFlowStatus.CLOSE);
    navigate(`/home`);
  };

  const openBot = async (botFolder) => {
    setCreationFlowStatus(CreationFlowStatus.CLOSE);
    openProject(botFolder);
  };

  const handleCreateNew = async (formData, templateId: string, qnaKbUrls?: string[]) => {
    const newBotData = {
      templateId: templateId || '',
      name: formData.name,
      description: formData.description,
      location: formData.location,
      schemaUrl: formData.schemaUrl,
      appLocale,
      qnaKbUrls,
    };
    createNewBot(newBotData);
  };

  const handleSaveAs = (formData) => {
    saveProjectAs(projectId, formData.name, formData.description, formData.location);
  };

  const handleCreateQnA = async (urls: string[]) => {
    saveTemplateId(QnABotTemplateId);
    handleDismiss();
    handleCreateNew(formData, QnABotTemplateId, urls);
  };

  const handleSubmitOrImportQnA = async (formData, templateId: string) => {
    if (templateId === 'QnASample') {
      setFormData(formData);
      navigate(`./QnASample/importQnA`);
      return;
    }
    handleSubmit(formData, templateId);
  };

  const handleSubmit = async (formData, templateId: string) => {
    handleDismiss();
    switch (creationFlowStatus) {
      case CreationFlowStatus.SAVEAS:
        handleSaveAs(formData);
        break;

      default:
        saveTemplateId(templateId);
        await handleCreateNew(formData, templateId);
    }
  };

  const handleCreateNext = async (data) => {
    setCreationFlowStatus(CreationFlowStatus.NEW_FROM_TEMPLATE);
    navigate(`./create/${data}`);
  };

  return (
    <Fragment>
      <Home />
      <Router>
        <DefineConversation
          createFolder={createFolder}
          focusedStorageFolder={focusedStorageFolder}
          path="create/:templateId"
          updateFolder={updateFolder}
          onCurrentPathUpdate={updateCurrentPath}
          onDismiss={handleDismiss}
          onSubmit={handleSubmitOrImportQnA}
        />
        <CreateOptions path="create" templates={templateProjects} onDismiss={handleDismiss} onNext={handleCreateNext} />
        <DefineConversation
          createFolder={createFolder}
          focusedStorageFolder={focusedStorageFolder}
          path=":projectId/:templateId/save"
          updateFolder={updateFolder}
          onCurrentPathUpdate={updateCurrentPath}
          onDismiss={handleDismiss}
          onSubmit={handleSubmitOrImportQnA}
        />
        <OpenProject
          focusedStorageFolder={focusedStorageFolder}
          path="open"
          onCurrentPathUpdate={updateCurrentPath}
          onDismiss={handleDismiss}
          onOpen={openBot}
        />
        <ImportQnAFromUrlModal
          dialogId={formData.name.toLowerCase()}
          path="create/QnASample/importQnA"
          onDismiss={handleDismiss}
          onSubmit={handleCreateQnA}
        />
      </Router>
    </Fragment>
  );
};

export default CreationFlow;
