// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Path from 'path';

import React, { useEffect, useContext, useRef, Fragment, Suspense } from 'react';
import { RouteComponentProps, Router, navigate } from '@reach/router';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { CreationFlowStatus } from '../../constants';
import { StoreContext } from '../../store';
import Home from '../../pages/home';

import { CreateOptions } from './CreateOptions/index';
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
  const { templateId, templateProjects, storages } = state;
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

  const init = async () => {
    fetchTemplates();
    fetchStorages();
  };

  useEffect(() => {
    init();
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
    handleDismiss();
  };

  const handleCreateNew = async formData => {
    await createProject(templateId || '', formData.name, formData.description, formData.location, formData.schemaUrl);
  };

  const handleSaveAs = async formData => {
    await saveProjectAs(state.projectId, formData.name, formData.description, formData.location);
  };

  const handleSubmit = formData => {
    switch (creationFlowStatus) {
      case CreationFlowStatus.NEW_FROM_SCRATCH:
      case CreationFlowStatus.NEW_FROM_TEMPLATE:
        handleCreateNew(formData);
        break;
      case CreationFlowStatus.SAVEAS:
        handleSaveAs(formData);
        break;

      default:
        handleCreateNew(formData);
    }
    handleDismiss();
  };

  const handleCreateNext = data => {
    navigate(`./create/template/${data}`);
  };

  return (
    <Fragment>
      <Home />
      <Suspense fallback={<LoadingSpinner />}>
        <Router>
          <CreateOptions
            templates={templateProjects}
            onDismiss={handleDismiss}
            onNext={handleCreateNext}
            saveTemplateId={saveTemplateId}
            path="/createProject"
          />
          <DefineConversation
            onSubmit={handleSubmit}
            onDismiss={handleDismiss}
            onCurrentPathUpdate={updateCurrentPath}
            path="create/template/:templateId"
          />
          <DefineConversation
            onSubmit={handleSubmit}
            onDismiss={handleDismiss}
            onCurrentPathUpdate={updateCurrentPath}
            path="/saveProject/:projectId"
          />
          <OpenProject
            onOpen={openBot}
            onDismiss={handleDismiss}
            onCurrentPathUpdate={updateCurrentPath}
            path="/openProject"
          />
        </Router>
      </Suspense>
    </Fragment>
  );
};

export default CreationFlow;
