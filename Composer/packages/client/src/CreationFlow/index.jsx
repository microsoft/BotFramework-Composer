// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Path from 'path';

import React, { useState, useEffect, useContext, useRef } from 'react';

import { CreationFlowStatus, DialogCreationCopy, Steps } from '../constants';

import { CreateOptions } from './CreateOptions/index';
import { DefineConversation } from './DefineConversation/index';
import { OpenProject } from './OpenProject';
import { StoreContext } from './../store';
import { StepWizard } from './StepWizard/StepWizard';
import { navigateTo } from './../utils/navigation';

export function CreationFlow(props) {
  const { state, actions } = useContext(StoreContext);
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

  const openBot = async (botFolder) => {
    await openBotProject(botFolder);
    handleDismiss();
  };

  const handleCreateNew = async (formData) => {
    await createProject(templateId || '', formData.name, formData.description, formData.location);
  };

  const handleSaveAs = async (formData) => {
    await saveProjectAs(state.projectId, formData.name, formData.description, formData.location);
  };

  const handleSubmit = (formData) => {
    switch (creationFlowStatus) {
      case CreationFlowStatus.NEW_FROM_SCRATCH:
      case CreationFlowStatus.NEW_FROM_TEMPLATE:
      case CreationFlowStatus.NEW:
        handleCreateNew(formData);
        break;
      case CreationFlowStatus.SAVEAS:
        handleSaveAs(formData);
        break;
      default:
        setStep(Steps.NONE);
        break;
    }
    handleDismiss();
  };

  const handleCreateNext = (data) => {
    saveTemplateId(data);
    setStep(Steps.DEFINE);
  };

  const steps = {
    [Steps.CREATE]: {
      ...DialogCreationCopy.CREATE_NEW_BOT,
      children: (
        <CreateOptions
          onDismiss={handleDismiss}
          onNext={handleCreateNext}
          saveTemplateId={saveTemplateId}
          templates={templateProjects}
        />
      ),
    },
    [Steps.LOCATION]: {
      ...DialogCreationCopy.SELECT_LOCATION,
      children: <OpenProject onCurrentPathUpdate={updateCurrentPath} onDismiss={handleDismiss} onOpen={openBot} />,
    },
    [Steps.DEFINE]: {
      ...DialogCreationCopy.DEFINE_CONVERSATION_OBJECTIVE,
      children: (
        <DefineConversation onCurrentPathUpdate={updateCurrentPath} onDismiss={handleDismiss} onSubmit={handleSubmit} />
      ),
    },
  };

  return <StepWizard onDismiss={handleDismiss} step={step} steps={steps} />;
}
