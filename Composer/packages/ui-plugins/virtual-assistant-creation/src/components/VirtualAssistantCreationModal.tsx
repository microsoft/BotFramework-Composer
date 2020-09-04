// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useState } from 'react';
import { RouteComponentProps, Router } from '@reach/router';
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

  return (
    <Fragment>
      <AppContext.Provider value={{ state, setState }}>
        <Router>
          <NewBotPage onDismiss={onDismiss} path={RouterPaths.newBotPage} default />
          <CustomizeBotPage onDismiss={onDismiss} path={RouterPaths.customizeBotPage} />
          <ConfigSummaryPage onDismiss={onDismiss} path={RouterPaths.configSummaryPage} />
          <ProvisionSummaryPage
            onDismiss={onDismiss}
            onSubmit={createAndConfigureBot}
            path={RouterPaths.provisionSummaryPage}
          />
        </Router>
      </AppContext.Provider>
    </Fragment>
  );
};

export default VirtualAssistantCreationModal;
