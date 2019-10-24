import React, { useState, useEffect, useContext } from 'react';
import { toLower } from 'lodash';

import { CreationFlowStatus, DialogCreationCopy, Steps } from '../constants';

import { CreateOptions } from './CreateOptions/index';
import { DefineConversation } from './DefineConversation/index';
import { OpenProject } from './OpenProject';
import { StoreContext } from './../store';
import { StepWizard } from './StepWizard/StepWizard';
import { navigateTo } from './../utils/navigation';

export function CreationFlow(props) {
  const { state, actions } = useContext(StoreContext);
  const [bots, setBots] = useState([]);
  const [step, setStep] = useState();
  // eslint-disable-next-line react/prop-types
  const { creationFlowStatus, setCreationFlowStatus } = props;
  const {
    fetchTemplates,
    getAllProjects,
    openBotProject,
    createProject,
    saveProjectAs,
    saveTemplateId,
    fetchStorages,
  } = actions;
  const { templateId, templateProjects } = state;

  useEffect(() => {
    init();
  }, [creationFlowStatus]);

  const getAllBots = async () => {
    const data = await getAllProjects();
    setBots(data);
  };

  const init = async () => {
    if (creationFlowStatus !== CreationFlowStatus.CLOSE) {
      fetchTemplates();
      await getAllBots();
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

  const openBot = async botFolder => {
    await openBotProject(botFolder);
    navigateTo('/dialogs/Main');
    handleDismiss();
  };

  const handleDismiss = () => {
    setCreationFlowStatus(CreationFlowStatus.CLOSE);
  };

  const handleCreateNew = async formData => {
    await createProject(templateId || '', formData.name, formData.description, formData.location);
  };

  const handleSaveAs = async formData => {
    await saveProjectAs(formData.name, formData.description);
  };

  const handleSubmit = formData => {
    switch (creationFlowStatus) {
      case CreationFlowStatus.NEW_FROM_SCRATCH:
      case CreationFlowStatus.NEW_FROM_TEMPLATE:
      case CreationFlowStatus.NEW:
        handleCreateNew(formData);
        navigateTo('/dialogs/Main');
        break;
      case CreationFlowStatus.SAVEAS:
        handleSaveAs(formData);
        navigateTo('/dialogs/Main');
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

  const getErrorMessage = name => {
    if (
      bots.findIndex(bot => {
        return toLower(bot.name) === toLower(name);
      }) >= 0
    ) {
      return 'duplication of name';
    }
    return '';
  };

  const steps = {
    [Steps.CREATE]: {
      ...DialogCreationCopy.CREATE_NEW_BOT,
      children: <CreateOptions templates={templateProjects} onDismiss={handleDismiss} onNext={handleCreateNext} />,
    },
    [Steps.LOCATION]: {
      ...DialogCreationCopy.SELECT_LOCATION,
      children: <OpenProject onOpen={openBot} onDismiss={handleDismiss} />,
    },
    [Steps.DEFINE]: {
      ...DialogCreationCopy.DEFINE_CONVERSATION_OBJECTIVE,
      children: (
        <DefineConversation
          onSubmit={handleSubmit}
          onGetErrorMessage={getErrorMessage}
          onDismiss={handleDismiss}
          enableLocationBrowse={true}
        />
      ),
    },
  };

  return <StepWizard steps={steps} step={step} onDismiss={handleDismiss} />;
}
