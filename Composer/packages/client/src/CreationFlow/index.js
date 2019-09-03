import React, { useState, useEffect, useContext } from 'react';

import { CreationFlowStatus } from '../constants';

import { CreateOptions } from './CreateOptions/index';
import { DefineConversation } from './DefineConversation/index';
import { Steps } from './../constants/index';
import { SelectLocation } from './SelectLocation';
import { StoreContext } from './../store';
import { DialogInfo } from './../constants/index';
import { StepWizard } from './StepWizard/StepWizard';
import { navigateTo } from './../utils/navigation';

export function CreationFlow(props) {
  const { state, actions } = useContext(StoreContext);
  const [templates, setTemplates] = useState([]);
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
    setLuisConfig,
    fetchStorages,
  } = actions;
  const { botName, templateId } = state;

  useEffect(() => {
    init();
  }, [creationFlowStatus]);

  const getTemplates = async () => {
    const data = await fetchTemplates();
    setTemplates(data);
  };

  const getAllBots = async () => {
    const data = await getAllProjects();
    setBots(data);
  };

  const init = async () => {
    if (creationFlowStatus !== CreationFlowStatus.CLOSE) {
      getTemplates();
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
    const { botName } = await openBotProject(botFolder);
    await setLuisConfig(botName);
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
    const { botName } = await saveProjectAs(formData.name, formData.description);
    setLuisConfig(botName);
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
        return bot.name === name;
      }) >= 0
    ) {
      return 'duplication of name';
    }
    return '';
  };

  const steps = {
    [Steps.CREATE]: {
      ...DialogInfo.CREATE_NEW_BOT,
      children: <CreateOptions templates={templates} onDismiss={handleDismiss} onNext={handleCreateNext} />,
    },
    [Steps.LOCATION]: {
      ...DialogInfo.SELECT_LOCATION,
      children: <SelectLocation folders={bots} defaultKey={botName || ''} onOpen={openBot} onDismiss={handleDismiss} />,
    },
    [Steps.DEFINE]: {
      ...DialogInfo.DEFINE_CONVERSATION_OBJECTIVE,
      children: (
        <DefineConversation onSubmit={handleSubmit} onGetErrorMessage={getErrorMessage} onDismiss={handleDismiss} />
      ),
    },
  };

  return <StepWizard steps={steps} step={step} onDismiss={handleDismiss} />;
}
