// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface, useRecoilCallback } from 'recoil';

import { botEndpointsState } from '..';

export const webChatDirectlineDispatcher = () => {
  const bootstrapChat = useRecoilCallback((callbackHelpers: CallbackInterface) => async (projectId: string) => {
    const { snapshot } = callbackHelpers;
    const botUrl = await snapshot.getPromise(botEndpointsState[projectId]);
    return botUrl;
  });

  return {
    bootstrapChat,
  };
};
