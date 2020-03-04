// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Path from 'path';

import React, { useState, useEffect, useContext, useRef } from 'react';
import get from 'lodash/get';

import { CreationFlowStatus, DialogCreationCopy, Steps, FileTypes } from '../constants';

import { CreateOptions } from './CreateOptions/index';
import { DefineConversation } from './DefineConversation/index';
import { OpenProject } from './OpenProject';
import { StoreContext } from './../store';
import { StepWizard } from './StepWizard/StepWizard';
import { navigateTo } from './../utils/navigation';

export function CreationFlow(props) {
  const { state, actions } = useContext(StoreContext);
  const [files, setFiles] = useState([]);
  const [step, setStep] = useState();
  // eslint-disable-next-line react/prop-types
  const { creationFlowStatus, setCreationFlowStatus } = props;
  const {
    fetchTemplates,
    openBotProject,
    createProject,
    saveProjectAs,
    saveTemplateId,
    fetchStorages,
    fetchFolderItemsByPath,
  } = actions;
  const { templateId, templateProjects, focusedStorageFolder, storages } = state;
  const currentStorageIndex = useRef(0);
  const storage = storages[currentStorageIndex.current];
  const currentStorageId = storage ? storage.id : 'default';
  const [currentPath, setCurrentPath] = useState('');
  useEffect(() => {
    if (storages && storages.length) {
      const storageId = storage.id;
      const path = storage.path;
      const formattedPath = Path.normalize(path);
      fetchFolderItemsByPath(storageId, formattedPath);
    }
  }, [storages]);

  useEffect(() => {
    const allFilesInFolder = get(focusedStorageFolder, 'children', []);

    setFiles(allFilesInFolder);
    if (Object.keys(focusedStorageFolder).length) {
      setCurrentPath(Path.join(focusedStorageFolder.parent, focusedStorageFolder.name));
    }
  }, [focusedStorageFolder]);

  useEffect(() => {
    init();
  }, [creationFlowStatus]);

  const init = () => {
    if (creationFlowStatus !== CreationFlowStatus.CLOSE) {
      fetchTemplates();
    }

    // load storage system list
    fetchStorages();

    switch (creationFlowStatus) {
      case CreationFlowStatus.NEW:
        setStep(Steps.CREATE);
        break;
      case CreationFlowStatus.OPEN:
        setStep(Steps.LOCATION);
        break;
      case CreationFlowStatus.NEW_FROM_SCRATCH:
      case CreationFlowStatus.NEW_FROM_TEMPLATE:
      case CreationFlowStatus.SAVEAS:
        setStep(Steps.DEFINE);
        break;
      default:
        setStep(Steps.NONE);
        break;
    }
  };

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
  };

  const openBot = async botFolder => {
    await openBotProject(botFolder);
    // navigateTo(`/bot/${state.projectId}/dialogs/Main`);
    handleDismiss();
  };

  const handleCreateNew = async formData => {
    await createProject(templateId || '', formData.name, formData.description, formData.location);
  };

  const handleSaveAs = async formData => {
    await saveProjectAs(state.projectId, formData.name, formData.description, formData.location);
  };

  const handleSubmit = formData => {
    switch (creationFlowStatus) {
      case CreationFlowStatus.NEW_FROM_SCRATCH:
      case CreationFlowStatus.NEW_FROM_TEMPLATE:
      case CreationFlowStatus.NEW:
        handleCreateNew(formData);
        //navigateTo(`/bot/${state.projectId}/dialogs/Main`);
        break;
      case CreationFlowStatus.SAVEAS:
        handleSaveAs(formData);
        navigateTo(`/bot/${state.projectId}/dialogs/Main`);
        break;
      default:
        setStep(Steps.NONE);
        break;
    }
    handleDismiss();
  };

  const handleCreateNext = data => {
    saveTemplateId(data);
    setStep(Steps.DEFINE);
  };

  const steps = {
    [Steps.CREATE]: {
      ...DialogCreationCopy.CREATE_NEW_BOT,
      children: <CreateOptions templates={templateProjects} onDismiss={handleDismiss} onNext={handleCreateNext} />,
    },
    [Steps.LOCATION]: {
      ...DialogCreationCopy.SELECT_LOCATION,
      children: (
        <OpenProject
          onOpen={openBot}
          onDismiss={handleDismiss}
          focusedStorageFolder={focusedStorageFolder}
          currentPath={currentPath}
          onCurrentPathUpdate={updateCurrentPath}
        />
      ),
    },
    [Steps.DEFINE]: {
      ...DialogCreationCopy.DEFINE_CONVERSATION_OBJECTIVE,
      children: (
        <DefineConversation
          onSubmit={handleSubmit}
          onDismiss={handleDismiss}
          onCurrentPathUpdate={updateCurrentPath}
          focusedStorageFolder={focusedStorageFolder}
          currentPath={currentPath}
          files={files}
        />
      ),
    },
  };

  return <StepWizard steps={steps} step={step} onDismiss={handleDismiss} />;
}
