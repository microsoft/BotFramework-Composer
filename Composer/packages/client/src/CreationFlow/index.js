import React, { useState, useEffect, useRef, useContext } from 'react';

import { CreationFlowStatus } from '../constants';

import { CreateOptionsDialog } from './CreateOptions/index';
import { DefineConversationDialog } from './DefineConversation/index';
import { Steps } from './../constants/index';
import { SelectLocationDialog } from './SelectLocation';
import { Store } from './../store/index';
import { DialogInfo } from './../constants/index';

export function CreationFlow(props) {
  const { state, actions } = useContext(Store);
  const [templates, setTemplates] = useState([]);
  const [bots, setBots] = useState([]);
  const [step, setStep] = useState();
  const template = useRef(null);
  // eslint-disable-next-line react/prop-types
  const { creationFlowStatus, setCreationFlowStatus } = props;
  const { fetchTemplates, getAllProjects, openBotProject, createProject, saveProjectAs } = actions;
  const { botProjFile } = state;

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

    switch (creationFlowStatus) {
      case CreationFlowStatus.NEW:
        setStep(Steps.CREATE);
        break;
      case CreationFlowStatus.OPEN:
        setStep(Steps.LOCATION);
        break;
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
    handleDismiss();
  };

  const handleDismiss = () => {
    setCreationFlowStatus(CreationFlowStatus.CLOSE);
  };

  const handleCreateNew = async formData => {
    await createProject(template.current || '', formData.name, formData.description);
  };

  const handleSaveAs = async formData => {
    await saveProjectAs(formData.name, formData.description);
  };

  const handleSubmit = formData => {
    switch (creationFlowStatus) {
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

  const handleCreateNext = data => {
    template.current = data;
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

  return (
    <>
      {creationFlowStatus === CreationFlowStatus.CLOSE ? null : (
        <>
          <CreateOptionsDialog
            title={DialogInfo.CREATE_NEW_BOT.title}
            subText={DialogInfo.CREATE_NEW_BOT.subText}
            hidden={step !== Steps.CREATE}
            templates={templates}
            onDismiss={handleDismiss}
            onNext={handleCreateNext}
          />
          <SelectLocationDialog
            hidden={step !== Steps.LOCATION}
            onDismiss={handleDismiss}
            defaultKey={botProjFile.path ? botProjFile.path.replace(`/${botProjFile.relativePath}`, '') : ''}
            folders={bots}
            onOpen={openBot}
          />
          <DefineConversationDialog
            title={DialogInfo.DEFINE_CONVERSATION_OBJECTIVE.title}
            subText={DialogInfo.DEFINE_CONVERSATION_OBJECTIVE.subText}
            hidden={step !== Steps.DEFINE}
            onDismiss={handleDismiss}
            onSubmit={handleSubmit}
            onGetErrorMessage={getErrorMessage}
          />
        </>
      )}
    </>
  );
}
