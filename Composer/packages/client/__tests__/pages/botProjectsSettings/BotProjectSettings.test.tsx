// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import React from 'react';

import BotProjectSettings from '../../../src/pages/botProject/BotProjectSettings';
import { renderWithRecoil } from '../../testUtils';
import {
  settingsState,
  currentProjectIdState,
  projectMetaDataState,
  botProjectIdsState,
  dialogState,
  luFilesState,
} from '../../../src/recoilModel';

const state = {
  dialogs: [
    {
      content: {
        recognizer: '',
      },
      id: 'dialog1',
    },
    {
      content: {
        recognizer: '',
      },
      id: 'dialog2',
    },
  ],
  qnaFiles: [
    {
      content: '',
      empty: true,
      id: 'dialog1.en-us',
    },
  ],
  luFiles: [
    {
      content: '',
      empty: true,
      id: 'dialog1.en-us',
    },
  ],
  projectId: 'test',
  settings: {},
  projectMetaDataState: {
    isRootBot: true,
    isRemote: false,
  },
  botProjectIdsState: ['test'],
};

describe('BotProject Settings Page', () => {
  const initRecoilState = ({ set }) => {
    set(currentProjectIdState, state.projectId);
    set(dialogState({ projectId: state.projectId, dialogId: state.dialogs[0].id }), state.dialogs[0]);
    set(dialogState({ projectId: state.projectId, dialogId: state.dialogs[1].id }), state.dialogs[1]);
    set(botProjectIdsState, state.botProjectIdsState);
    set(luFilesState(state.projectId), state.luFiles);
    set(projectMetaDataState(state.projectId), state.projectMetaDataState);
    set(settingsState(state.projectId), state.settings);
  };
  it('should render page title', () => {
    const { getByText } = renderWithRecoil(<BotProjectSettings projectId={state.projectId} />, initRecoilState);
    expect(getByText('Bot management and configurations')).toBeInTheDocument();
  });
});
