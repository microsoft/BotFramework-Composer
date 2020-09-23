// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import { RouteComponentProps, Router } from '@reach/router';
import { NewBotPage } from './newBotPage';
import { CustomizeBotPage } from './customizeBotPage';
import { ConfigSummaryPage } from './configSummaryPage';
import { AppContextDefaultValue } from '../models/stateModels';
import { useShellApi } from '@bfc/extension-client';
import { updatePersonalityQnaFile } from '../shared/util';
import ProvisionSummaryPage from './provisionSummaryPage';
import { RouterPaths } from '../shared/constants';
import { navigate } from '@reach/router';
import { formData } from '../shared/types';

// -------------------- VirtualAssistantCreationModal -------------------- //
type VirtualAssistantCreationModalProps = {
  onDismiss: () => void;
  handleCreateNew: (formData: formData, templateId: string) => Promise<void>;
  formData: formData;
} & RouteComponentProps<{}>;

export const AppContext = React.createContext(AppContextDefaultValue);

export const VirtualAssistantCreationModal: React.FC<VirtualAssistantCreationModalProps> = (props) => {
  const { onDismiss, handleCreateNew, formData } = props;
  const [state, setState] = useState(AppContextDefaultValue.state);
  const { shellApi } = useShellApi();

  var createAndConfigureBot = async () => {
    await handleCreateNew(formData, 'vacore');
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
  );
};

export default VirtualAssistantCreationModal;
