// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

export enum PromptTab {
  BOT_ASKS = 'botAsks',
  USER_INPUT = 'userInput',
  OTHER = 'other',
}

export const PromptTabTitles = {
  [PromptTab.BOT_ASKS]: () => formatMessage('Bot Asks'),
  [PromptTab.USER_INPUT]: () => formatMessage('User input'),
  [PromptTab.OTHER]: () => formatMessage('Other'),
};
