// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useState } from 'react';
import { RouteComponentProps, Router, NavigateFn } from '@reach/router';
import NewBotPage from './newBotPage';
import CustomizeBotPage from './customizeBotPage';
import PreProvisionPage, { ConfigSummaryPage } from './configSummaryPage';
import { AppContextDefaultValue } from '../models/stateModels';
import { useShellApi, JSONSchema7 } from '@bfc/extension';
import fs from 'fs';
import axios from 'axios';
import { updatePersonalityQnaFile } from '../shared/utils/util';
import ProvisionSummaryPage from './provisionSummaryPage';
import { RouterPaths } from '../shared/constants';
import { navigate } from '@reach/router';

interface VirtualAssistantCreationModalProps
  extends RouteComponentProps<{
    location: string;
  }> {
  // handleCreateNew: (formData: any, );
  onDismiss: () => void;
  handleCreateNew: (formData: any, templateId: string) => Promise<void>;
  formData: any;
}

export const AppContext = React.createContext(AppContextDefaultValue);

export const VirtualAssistantCreationModal: React.FC<VirtualAssistantCreationModalProps> = (props) => {
  const { onDismiss, handleCreateNew, formData } = props;
  const [state, setState] = useState(AppContextDefaultValue.state);
  const { shellApi, ...shellData } = useShellApi();

  const createAndConfigureBot = async () => {
    await handleCreateNew(formData, 'va-core');
    await updateBotResponses();
    await updateQnaFiles();
    navigate('./');
  };

  const updateBotResponses = async () => {
    const generatedLgFileId = formData.name + '.en-us';
    await shellApi.updateLgTemplate(
      generatedLgFileId,
      'ReturningUserGreeting',
      createLgFromString(state.selectedGreetingMessage)
    );
    await shellApi.updateLgTemplate(
      generatedLgFileId,
      'NewUserGreeting',
      createLgFromString(state.selectedGreetingMessage)
    );
    await shellApi.updateLgTemplate(generatedLgFileId, 'BotName', createLgFromString(state.selectedBotName));
    await shellApi.updateLgTemplate(
      generatedLgFileId,
      'FallBackMessage',
      createLgFromString(state.selectedFallbackText)
    );
  };

  const updateQnaFiles = async () => {
    await updatePersonalityQnaFile(shellApi, state.selectedPersonality);
  };

  const createLgFromString = (text: string) => {
    return '- ' + text;
  };

  const onModalDismiss = () => {
    navigate('./');
    onDismiss();
  };

  return (
    <Fragment>
      <AppContext.Provider value={{ state, setState }}>
        <Router>
          <NewBotPage onDismiss={onModalDismiss} path={RouterPaths.newBotPage} default />
          <CustomizeBotPage onDismiss={onModalDismiss} path={RouterPaths.customizeBotPage} />
          <ConfigSummaryPage onDismiss={onModalDismiss} path={RouterPaths.configSummaryPage} />
          <ProvisionSummaryPage
            onDismiss={onModalDismiss}
            onSubmit={createAndConfigureBot}
            path={RouterPaths.provisionSummaryPage}
          />
        </Router>
      </AppContext.Provider>
    </Fragment>
  );
};

export default VirtualAssistantCreationModal;
