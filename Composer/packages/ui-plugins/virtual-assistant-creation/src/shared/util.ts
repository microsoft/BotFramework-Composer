// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';
import { ShellApi } from '@bfc/shared';

import { AvailablePersonalities } from '../models/creationOptions';

// Utility constants
const GitHubRepoApiRootUrl =
  'https://api.github.com/repos/microsoft/BotBuilder-PersonalityChat/contents/CSharp/Datasets/qnaFormat/';

// GitHub API Utility Functions
export const updatePersonalityQnaFile = async (shellApi: ShellApi, selectedPersonality: AvailablePersonalities) => {
  const personalityFileName = `qna_chitchat_${selectedPersonality}.qna`;
  // TODO: handle different markets once creation supports multi-local
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
