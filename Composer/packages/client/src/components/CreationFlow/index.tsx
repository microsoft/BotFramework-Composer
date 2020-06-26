// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// TODO: Remove path module
import Path from 'path';

import React, { useEffect, useContext, useRef, Fragment } from 'react';
import { RouteComponentProps, Router, navigate } from '@reach/router';
import { useRecoilValue } from 'recoil';

import { CreationFlowStatus } from '../../constants';
import { StoreContext } from '../../store';
import Home from '../../pages/home';
import { dispatcherState } from '../../recoilModel/DispatcherWraper';
import { navigateTo } from '../../utils';

import { CreateOptions } from './CreateOptions';
import { OpenProject } from './OpenProject';
import DefineConversation from './DefineConversation';

type CreationFlowProps = RouteComponentProps<{}>;

const CreationFlow: React.FC<CreationFlowProps> = () => {
  const { state, actions } = useContext(StoreContext);
  const { openBotProject, fetchTemplateProjects } = useRecoilValue(dispatcherState);
  const { creationFlowStatus } = state;
  const { saveProjectAs, saveTemplateId, fetchStorages, fetchFolderItemsByPath, setCreationFlowStatus } = actions;
  const { templateId, templateProjects, storages, focusedStorageFolder } = state;
  const { createProject } = useRecoilValue(dispatcherState);
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
    fetchTemplateProjects();
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

  const openBot = async (botFolder) => {
    const projectId = await openBotProject(botFolder);
    setCreationFlowStatus(CreationFlowStatus.CLOSE);
    const mainUrl = `/bot/${projectId}/dialogs/Main`;
    navigateTo(mainUrl);
  };

  const handleCreateNew = async (formData) => {
    const projectId = await createProject(
      templateId || '',
      formData.name,
      formData.description,
      Path.join(focusedStorageFolder.parent || '', focusedStorageFolder.name || ''),
      formData.schemaUrl
    );
    const mainUrl = `/bot/${projectId}/dialogs/Main`;
    navigateTo(mainUrl);
  };

  const handleSaveAs = async (formData) => {
    await saveProjectAs(
      state.projectId,
      formData.name,
      formData.description,
      Path.join(focusedStorageFolder.parent || '', focusedStorageFolder.name || '')
    );
  };

  const handleSubmit = async (formData) => {
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

  const handleCreateNext = async (data) => {
    await setCreationFlowStatus(CreationFlowStatus.NEW_FROM_TEMPLATE);
    navigate(`./create/${data}`);
  };

  return (
    <Fragment>
      <Home />
      <Router>
        <DefineConversation
          focusedStorageFolder={focusedStorageFolder}
          path="create/:templateId"
          saveTemplateId={saveTemplateId}
          onCurrentPathUpdate={updateCurrentPath}
          onDismiss={handleDismiss}
          onSubmit={handleSubmit}
        />
        <CreateOptions path="create" templates={templateProjects} onDismiss={handleDismiss} onNext={handleCreateNext} />
        <DefineConversation
          focusedStorageFolder={focusedStorageFolder}
          path=":projectId/:templateId/save"
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
