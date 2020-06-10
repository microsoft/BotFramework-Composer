// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

export enum PromptTab {
  BOT_ASKS = 'botAsks',
  USER_INPUT = 'userInput',
  OTHER = 'other',
}

export const PropmtTabTitles = {
  [PromptTab.BOT_ASKS]: formatMessage('Bot Asks'),
  [PromptTab.USER_INPUT]: formatMessage('User Input'),
  [PromptTab.OTHER]: formatMessage('Other'),
};
