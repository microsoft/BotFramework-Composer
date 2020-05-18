// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// TODO: Remove path module
import Path from 'path';

import React, { useEffect, useContext, useRef, Fragment } from 'react';
import { RouteComponentProps, Router, navigate } from '@reach/router';

import { CreationFlowStatus } from '../../constants';
import { StoreContext } from '../../store';
import Home from '../../pages/home';

import { CreateOptions } from './CreateOptions';
import { OpenProject } from './OpenProject';
import DefineConversation from './DefineConversation';

type CreationFlowProps = RouteComponentProps<{}>;

const CreationFlow: React.FC<CreationFlowProps> = () => {
  const { state, actions } = useContext(StoreContext);
  const { creationFlowStatus } = state;
  const {
    fetchTemplates,
    openBotProject,
    createProject,
    saveProjectAs,
    saveTemplateId,
    fetchStorages,
    fetchFolderItemsByPath,
    setCreationFlowStatus,
  } = actions;
  const { templateId, templateProjects, storages, focusedStorageFolder } = state;
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
      await actions.updateCurrentPath(formattedPath, storageId);
    }
  };

  const handleDismiss = () => {
    setCreationFlowStatus(CreationFlowStatus.CLOSE);
    navigate(`/home`);
  };

  const openBot = async botFolder => {
    await openBotProject(botFolder);
    setCreationFlowStatus(CreationFlowStatus.CLOSE);
  };

  const handleCreateNew = async formData => {
    await createProject(
      templateId || '',
      formData.name,
      formData.description,
      Path.join(focusedStorageFolder.parent || '', focusedStorageFolder.name || ''),
      formData.schemaUrl
    );
  };

  const handleSaveAs = async formData => {
    await saveProjectAs(
      state.projectId,
      formData.name,
      formData.description,
      Path.join(focusedStorageFolder.parent || '', focusedStorageFolder.name || '')
    );
  };

  const handleSubmit = async formData => {
    handleDismiss();
    switch (creationFlowStatus) {
      case CreationFlowStatus.NEW_FROM_SCRATCH:
      case CreationFlowStatus.NEW_FROM_TEMPLATE:
        await handleCreateNew(formData);
        break;
      case CreationFlowStatus.SAVEAS:
        handleSaveAs(formData);
        break;

      default:
        await handleCreateNew(formData);
    }
  };

  const handleCreateNext = async data => {
    await setCreationFlowStatus(CreationFlowStatus.NEW_FROM_TEMPLATE);
    navigate(`./create/${data}`);
  };

  return (
    <Fragment>
      <Home />
      <Router>
        <DefineConversation
          onSubmit={handleSubmit}
          onDismiss={handleDismiss}
          onCurrentPathUpdate={updateCurrentPath}
          focusedStorageFolder={focusedStorageFolder}
          path="create/:templateId"
          saveTemplateId={saveTemplateId}
        />
        <CreateOptions templates={templateProjects} onDismiss={handleDismiss} onNext={handleCreateNext} path="create" />
        <DefineConversation
          onSubmit={handleSubmit}
          onDismiss={handleDismiss}
          onCurrentPathUpdate={updateCurrentPath}
          focusedStorageFolder={focusedStorageFolder}
          path=":projectId/:templateId/save"
        />
        <OpenProject
          onOpen={openBot}
          onDismiss={handleDismiss}
          onCurrentPathUpdate={updateCurrentPath}
          focusedStorageFolder={focusedStorageFolder}
          path="open"
        />
      </Router>
    </Fragment>
  );
};

export default CreationFlow;
