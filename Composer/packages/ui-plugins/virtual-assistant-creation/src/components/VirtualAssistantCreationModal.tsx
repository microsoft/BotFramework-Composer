// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, Router } from '@reach/router';
import { useShellApi } from '@bfc/extension-client';
import { navigate } from '@reach/router';

import { AppContextDefaultValue } from '../models/stateModels';
import { updatePersonalityQnaFile } from '../shared/util';
import { RouterPaths } from '../shared/constants';
import { formData } from '../shared/types';

import { NewBotPage } from './newBotPage';
import { CustomizeBotPage } from './customizeBotPage';
import { ConfigSummaryPage } from './configSummaryPage';
import ProvisionSummaryPage from './provisionSummaryPage';

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
  const { shellApi, ...shellData } = useShellApi();
  const { projectId } = shellData;
  const [initialProjectId, setInitialProjectId] = useState(projectId);

  const createAndConfigureBot = async () => {
    handleCreateNew(formData, 'vaCore');
  };

  const updateBotResponses = async () => {
    const generatedLgFileId = formData.name.toLowerCase() + '.en-us';
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

  // projectID change indicates that the project files have been created and post create calls can be executed
  useEffect((): void => {
    if (projectId !== initialProjectId) {
      updateBotResponses();
      updateQnaFiles();
      navigate('./');
    }
  }, [projectId, shellApi]);

  return (
    <AppContext.Provider value={{ state, setState }}>
      <Router>
        <NewBotPage default path={RouterPaths.newBotPage} onDismiss={onModalDismiss} />
        <CustomizeBotPage path={RouterPaths.customizeBotPage} onDismiss={onModalDismiss} />
        <ConfigSummaryPage path={RouterPaths.configSummaryPage} onDismiss={onModalDismiss} />
        <ProvisionSummaryPage
          path={RouterPaths.provisionSummaryPage}
          onDismiss={onModalDismiss}
          onSubmit={createAndConfigureBot}
        />
      </Router>
    </AppContext.Provider>
  );
};

export default VirtualAssistantCreationModal;
