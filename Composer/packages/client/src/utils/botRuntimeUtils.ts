// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotStatus, BotStatusesCopy } from '../constants';

export const getBotStatusText = (currentBotStatus) => {
  switch (currentBotStatus) {
    case BotStatus.failed:
      return BotStatusesCopy.failed;

    case BotStatus.published:
      return BotStatusesCopy.published;

    case BotStatus.reloading:
      return BotStatusesCopy.loading;

    case BotStatus.connected: {
      return BotStatusesCopy.connected;
    }
    case BotStatus.publishing:
      return BotStatusesCopy.publishing;

    default:
    case BotStatus.unConnected:
      return BotStatusesCopy.unConnected;
  }
};
