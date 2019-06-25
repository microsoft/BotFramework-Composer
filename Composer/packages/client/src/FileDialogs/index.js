import React, { Fragment, useState, useEffect, useRef, useContext } from 'react';

import { OpenStatus } from '../constants';

import { CreateOptionsDialog } from './CreateOptions/index';
import { DefineConversationDialog } from './DefineConversation/index';
import { Steps } from './../constants/index';
import { SelectLocationDialog } from './SelectLocation';
import { Store } from './../store/index';

export function FileDialogs(props) {
  const { actions } = useContext(Store);
  const [templates, setTemplates] = useState([]);
  const [bots, setBots] = useState([]);
  const [step, setStep] = useState();
  const template = useRef(null);
  // eslint-disable-next-line react/prop-types
  const { openStatus, setOpenStatus } = props;
  const { fetchTemplates, getAllBotsFromFixedLocation, openBotProject, createProject, saveProjectAs } = actions;

  useEffect(() => {
    if (openStatus !== OpenStatus.CLOSE) {
      getTemplates();
      getAllBots();
    }
  }, [openStatus]);

  useEffect(() => {
    switch (openStatus) {
      case OpenStatus.NEW:
        setStep(Steps.CREATE);
        break;
      case OpenStatus.OPEN:
        setStep(Steps.LOCATION);
        break;
      case OpenStatus.SAVEAS:
        setStep(Steps.DEFINE);
        break;
      default:
        setStep(Steps.NONE);
        break;
    }
  }, [openStatus]);

  const getTemplates = async () => {
    const data = await fetchTemplates();
    setTemplates(data);
  };

  const getAllBots = async () => {
    const data = await getAllBotsFromFixedLocation();
    setBots(data);
  };

  const openBot = async botFolder => {
    await openBotProject(botFolder);
    handleDismiss();
  };

  const handleDismiss = () => {
    setOpenStatus(OpenStatus.CLOSE);
  };

  const handleCreateNew = async formDate => {
    await createProject(template.current || '', formDate.name, formDate.description);
  };

  const handleSaveAs = async formDate => {
    await saveProjectAs(formDate.name, formDate.description);
  };

  const handleSubmit = formDate => {
    switch (openStatus) {
      case OpenStatus.NEW:
        handleCreateNew(formDate);
        break;
      case OpenStatus.SAVEAS:
        handleSaveAs(formDate);
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
    <Fragment>
      {openStatus === OpenStatus.CLOSE ? null : (
        <Fragment>
          <CreateOptionsDialog
            hidden={step !== Steps.CREATE}
            templates={templates}
            onDismiss={handleDismiss}
            onNext={handleCreateNext}
          />
          <SelectLocationDialog
            hidden={step !== Steps.LOCATION}
            onDismiss={handleDismiss}
            folders={bots}
            onOpen={openBot}
          />
          <DefineConversationDialog
            hidden={step !== Steps.DEFINE}
            onDismiss={handleDismiss}
            onSubmit={handleSubmit}
            onGetErrorMessage={getErrorMessage}
          />
        </Fragment>
      )}
    </Fragment>
  );
}
