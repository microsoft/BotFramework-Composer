import axios from 'axios';
import { ShellApi } from '@bfc/shared';
import { AvailablePersonalities } from '../../models/creationOptions';

// GitHub API Utility Functions

export const updatePersonalityQnaFile = async (shellApi: ShellApi, selectedPersonality: AvailablePersonalities) => {
  const GitHubRepoApiRootUrl =
    'https://api.github.com/repos/microsoft/BotBuilder-PersonalityChat/contents/CSharp/Datasets/qnaFormat/';
  const personalityFileName = 'qna_chitchat_' + selectedPersonality + '.qna';

  // TODO: handle different markets once creation supports multi-local
  const endpoint = GitHubRepoApiRootUrl + 'english/' + personalityFileName;
  axios({
    method: 'get',
    url: endpoint,
    responseType: 'json',
  }).then(async function (response) {
    console.log(response);

    await shellApi.updateQnaContent('Chitchat2.en-us', atob(response.data.content));
    return response;
  });
};
