// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// TODO: Remove path module
import Path from 'path';

import React, { useEffect, useRef, Fragment } from 'react';
import { RouteComponentProps, Router, navigate } from '@reach/router';
import { useRecoilValue } from 'recoil';

import { CreationFlowStatus } from '../../constants';
import {
  dispatcherState,
  creationFlowStatusState,
  projectIdState,
  templateProjectsState,
  storagesState,
  focusedStorageFolderState,
} from '../../recoilModel';
import Home from '../../pages/home/Home';
import { useProjectIdCache } from '../../utils/hooks';

import { CreateOptions } from './CreateOptions';
import { OpenProject } from './OpenProject';
import DefineConversation from './DefineConversation';

type CreationFlowProps = RouteComponentProps<{}>;

const CreationFlow: React.FC<CreationFlowProps> = () => {
  const {
    fetchTemplates,
    openBotProject,
    createProject,
    saveProjectAs,
    fetchStorages,
    fetchFolderItemsByPath,
    setCreationFlowStatus,
    createFolder,
    updateCurrentPathForStorage,
    updateFolder,
    saveTemplateId,
    fetchProjectById,
    fetchRecentProjects,
  } = useRecoilValue(dispatcherState);
  const creationFlowStatus = useRecoilValue(creationFlowStatusState);
  const projectId = useRecoilValue(projectIdState);
  const templateProjects = useRecoilValue(templateProjectsState);
  const storages = useRecoilValue(storagesState);
  const focusedStorageFolder = useRecoilValue(focusedStorageFolderState);
  const cachedProjectId = useProjectIdCache();
  const currentStorageIndex = useRef(0);
  const storage = storages[currentStorageIndex.current];
  const currentStorageId = storage ? storage.id : 'default';

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
    openBotProject(botFolder);
  };

  const handleCreateNew = async (formData, templateId: string) => {
    createProject(templateId || '', formData.name, formData.description, formData.location, formData.schemaUrl);
  };

  const handleSaveAs = (formData) => {
    saveProjectAs(projectId, formData.name, formData.description, formData.location);
  };

  const handleSubmit = async (formData, templateId: string) => {
    handleDismiss();
    switch (creationFlowStatus) {
      case CreationFlowStatus.SAVEAS:
        handleSaveAs(formData);
        break;

      default:
        saveTemplateId(templateId);
        handleCreateNew(formData, templateId);
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
          onSubmit={handleSubmit}
        />
        <CreateOptions path="create" templates={templateProjects} onDismiss={handleDismiss} onNext={handleCreateNext} />
        <DefineConversation
          createFolder={createFolder}
          focusedStorageFolder={focusedStorageFolder}
          path=":projectId/:templateId/save"
          updateFolder={updateFolder}
          onCurrentPathUpdate={updateCurrentPath}
          onDismiss={handleDismiss}
          onSubmit={handleSubmit}
        />
        <OpenProject
          focusedStorageFolder={focusedStorageFolder}
          path="open"
          onCurrentPathUpdate={updateCurrentPath}
          onDismiss={handleDismiss}
          onOpen={openBot}
        />
      </Router>
    </Fragment>
  );
};

export default CreationFlow;
