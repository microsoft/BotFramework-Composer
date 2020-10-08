// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, Router } from '@reach/router';
import { useShellApi } from '@bfc/extension-client';
import { navigate } from '@reach/router';

import { updatePersonalityQnaFile } from '../util';
import { RouterPaths } from '../constants';
import { BotCreationFormData } from '../types';
import { CustomizeBotPageState, getInitialAppState, SelectBotPageState } from '../models/stateModels';

import { NewBotPage } from './NewBotPage';
import { CustomizeBotPage } from './CustomizeBotPage';
import { ConfigSummaryPage } from './ConfigSummaryPage';
import ProvisionSummaryPage from './ProvisionSummaryPage';

// -------------------- VirtualAssistantCreationModal -------------------- //
type VirtualAssistantCreationModalProps = {
  onDismiss: () => void;
  handleCreateNew: (formData: BotCreationFormData, templateId: string) => Promise<void>;
  formData: BotCreationFormData;
} & RouteComponentProps<{}>;

const createLgFromString = (text: string) => {
  if (text && text.length > 0 && text[0] !== '-') {
    return `- ${text}`;
  }
  return text;
};

export const VirtualAssistantCreationModal: React.FC<VirtualAssistantCreationModalProps> = (props) => {
  const { onDismiss, handleCreateNew, formData } = props;
  const [state, setState] = useState(getInitialAppState());
  const { shellApi, projectId } = useShellApi();
  const [initialProjectId] = useState(projectId);

  const createAndConfigureBot = async () => {
    handleCreateNew(formData, 'vaCore');
  };

  const updateBotResponses = async () => {
    // VA creation POC initially scoped for english
    const generatedLgFileId = formData.name.toLowerCase() + '.en-us';
    await shellApi.updateLgTemplate(
      generatedLgFileId,
      'ReturningUserGreeting',
      createLgFromString(state.CustomizeBotPageState.selectedGreetingMessage)
    );
    await shellApi.updateLgTemplate(
      generatedLgFileId,
      'NewUserGreeting',
      createLgFromString(state.CustomizeBotPageState.selectedGreetingMessage)
    );
    await shellApi.updateLgTemplate(
      generatedLgFileId,
      'BotName',
      createLgFromString(state.CustomizeBotPageState.selectedBotName)
    );
    await shellApi.updateLgTemplate(
      generatedLgFileId,
      'FallBackMessage',
      createLgFromString(state.CustomizeBotPageState.selectedFallbackText)
    );
  };

  const updateQnaFiles = async () => {
    updatePersonalityQnaFile(shellApi, state.CustomizeBotPageState.selectedPersonality);
  };

  const onModalDismiss = () => {
    navigate('./');
    onDismiss();
  };

  const updateGlobalCustomizeState = (newCustomizeState: CustomizeBotPageState) => {
    setState({ ...state, CustomizeBotPageState: newCustomizeState });
  };

  const updateGlobalSelectBotState = (newSelectBotPageState: SelectBotPageState) => {
    setState({ ...state, SelectBotPageState: newSelectBotPageState });
  };

  // projectID change indicates that the project files have been created and post create calls can be executed
  useEffect((): void => {
    if (projectId !== initialProjectId) {
      updateQnaFiles();
      updateBotResponses();
      navigate('./');
    }
  }, [projectId, shellApi]);
  return (
    <Router>
      <NewBotPage
        default
        globalSelectBotState={state.SelectBotPageState}
        path={RouterPaths.newBotPage}
        updateGlobalSelectBotState={updateGlobalSelectBotState}
        onDismiss={onModalDismiss}
      />
      <CustomizeBotPage
        globalCustomizeState={state.CustomizeBotPageState}
        path={RouterPaths.customizeBotPage}
        updateGlobalCustomizeState={updateGlobalCustomizeState}
        onDismiss={onModalDismiss}
      />
      <ConfigSummaryPage appState={state} path={RouterPaths.configSummaryPage} onDismiss={onModalDismiss} />
      <ProvisionSummaryPage
        path={RouterPaths.provisionSummaryPage}
        onDismiss={onModalDismiss}
        onSubmit={createAndConfigureBot}
      />
    </Router>
  );
};
