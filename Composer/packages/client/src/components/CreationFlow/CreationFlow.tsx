// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// TODO: Remove path module
import Path from 'path';

import React, { useEffect, useRef, Fragment } from 'react';
import { RouteComponentProps, Router, navigate } from '@reach/router';
import { useRecoilValue } from 'recoil';

import { CreationFlowStatus } from '../../constants';
import Home from '../../pages/home';
import {
  dispatcherState,
  creationFlowStatusState,
  projectIdState,
  templateProjectsState,
  storagesState,
  focusedStorageFolderState,
} from '../../recoilModel';
import { navigateTo } from '../../utils/navigation';

import { CreateOptions } from './CreateOptions/CreateOptions';
import { OpenProject } from './OpenProject/OpenProject';
import DefineConversation from './DefineConversation/DefineConversation';

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
    navTo,
  } = useRecoilValue(dispatcherState);
  const creationFlowStatus = useRecoilValue(creationFlowStatusState);
  const projectId = useRecoilValue(projectIdState);
  const templateProjects = useRecoilValue(templateProjectsState);
  const storages = useRecoilValue(storagesState);
  const focusedStorageFolder = useRecoilValue(focusedStorageFolderState);
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

  useEffect(() => {
    fetchStorages();
    fetchTemplates();
  }, []);

  const updateCurrentPath = async (newPath, storageId) => {
    if (!storageId) {
      storageId = currentStorageId;
    }
    if (newPath) {
      const formattedPath = Path.normalize(newPath);
      await updateCurrentPathForStorage(formattedPath, storageId);
    }
  };

  const handleDismiss = () => {
    setCreationFlowStatus(CreationFlowStatus.CLOSE);
    navigate(`/home`);
  };

  const openBot = async (botFolder) => {
    const projectId = await openBotProject(botFolder);
    if (projectId) {
      setCreationFlowStatus(CreationFlowStatus.CLOSE);
      const mainUrl = `/bot/${projectId}/dialogs/Main`;

      navigateTo(mainUrl);
    }
  };

  const handleCreateNew = async (formData, templateId: string) => {
    await createProject(templateId || '', formData.name, formData.description, formData.location, formData.schemaUrl);
    navTo('main');
  };

  const handleSaveAs = async (formData) => {
    await saveProjectAs(projectId, formData.name, formData.description, formData.location);
    navTo('main');
  };

  const handleSubmit = async (formData, templateId: string) => {
    handleDismiss();
    switch (creationFlowStatus) {
      case CreationFlowStatus.NEW_FROM_SCRATCH:
      case CreationFlowStatus.NEW_FROM_TEMPLATE:
        await handleCreateNew(formData, templateId);
        break;
      case CreationFlowStatus.SAVEAS:
        handleSaveAs(formData);
        break;

      default:
        await handleCreateNew(formData, templateId);
    }
  };

  const handleCreateNext = async (data) => {
    await setCreationFlowStatus(CreationFlowStatus.NEW_FROM_TEMPLATE);
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
