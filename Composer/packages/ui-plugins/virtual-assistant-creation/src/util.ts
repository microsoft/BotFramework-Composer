// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';
import { ShellApi } from '@bfc/shared';

import { AvailablePersonalities } from './types';

// Utility constants
const GitHubRepoApiRootUrl =
  'https://api.github.com/repos/microsoft/BotBuilder-PersonalityChat/contents/CSharp/Datasets/qnaFormat/';

// GitHub API Utility Functions
export const updatePersonalityQnaFile = async (shellApi: ShellApi, selectedPersonality: AvailablePersonalities) => {
  const personalityFileName = `qna_chitchat_${selectedPersonality}.qna`;
  // Only handling english market for this POC
  const endpoint = `${GitHubRepoApiRootUrl}english/${personalityFileName}`;
  axios({
    method: 'get',
    url: endpoint,
    responseType: 'json',
  })
    .then(async (response) => {
      await shellApi.updateQnaContent('Chit-chat.en-us', atob(response.data.content));
      return response;
    })
    .catch((err) => {
      console.error('Error occurred while grabbing personality chat files from GitHub ', err);
    });
};
