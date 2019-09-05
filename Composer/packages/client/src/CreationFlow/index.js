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
  const [bots, setBots] = useState([]);
  const [step, setStep] = useState();
  // eslint-disable-next-line react/prop-types
  const { creationFlowStatus, setCreationFlowStatus } = props;
  const { fetchTemplates, getAllProjects, openBotProject, createProject, saveProjectAs, saveTemplateId } = actions;
  const { botName, templateId, templateProjects } = state;

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
    await openBotProject({ absolutePath: botFolder });
    navigateTo('/dialogs/Main');
    handleDismiss();
  };

  const handleDismiss = () => {
    setCreationFlowStatus({ creationFlowStatus: CreationFlowStatus.CLOSE });
  };

  const handleCreateNew = async formData => {
    await createProject({ templateId: templateId || '', name: formData.name, description: formData.description });
  };

  const handleSaveAs = async formData => {
    await saveProjectAs({ name: formData.name, description: formData.description });
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
    saveTemplateId({ templateId: data });
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
      children: <CreateOptions templates={templateProjects} onDismiss={handleDismiss} onNext={handleCreateNext} />,
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
