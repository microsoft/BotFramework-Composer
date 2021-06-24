// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotStatus } from '../../constants';

export const isBotStarting = (currentStatus: BotStatus) => {
  return (
    currentStatus === BotStatus.publishing ||
    currentStatus === BotStatus.published ||
    currentStatus == BotStatus.pending ||
    currentStatus === BotStatus.queued ||
    currentStatus === BotStatus.starting
  );
};
