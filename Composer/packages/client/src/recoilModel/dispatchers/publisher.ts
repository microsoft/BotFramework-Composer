// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import formatMessage from 'format-message';
import { CallbackInterface, useRecoilCallback } from 'recoil';

import { publishTypesState, botStatusState, publishHistoryState, botLoadErrorState } from '../atoms/botState';
import filePersistence from '../persistence/FilePersistence';
import { botEndpointsState } from '../atoms';

import { BotStatus, Text } from './../../constants';
import httpClient from './../../utils/httpUtil';
import { logMessage } from './shared';

export const publisherDispatcher = () => {
  const publishFailure = async ({ set }: CallbackInterface, title: string, error, target) => {
    if (target.name === 'default') {
      set(botStatusState, BotStatus.failed);
      set(botLoadErrorState, { ...error, title });
    }
    // prepend the latest publish results to the history

    set(publishHistoryState, (publishHistory) => {
      const targetHistory = publishHistory[target.name] ?? [];
      return {
        ...publishHistory,
        [target.name]: [error, ...targetHistory],
      };
    });
  };

  const publishSuccess = async ({ set }: CallbackInterface, projectId: string, data, target) => {
    const { endpointURL } = data;
    if (target.name === 'default' && endpointURL) {
      set(botStatusState, BotStatus.connected);
      set(botEndpointsState, (botEndpoints) => ({ ...botEndpoints, [projectId]: `${endpointURL}/api/messages` }));
    }

    set(publishHistoryState, (publishHistory) => {
      const targetHistory = publishHistory[target.name] ?? [];
      return {
        ...publishHistory,
        [target.name]: [
          {
            ...data,
            target: target,
          },
          ...targetHistory,
        ],
      };
    });
    set(publishTypesState, data);
  };

  const updatePublishStatus = async (
    { set, snapshot }: CallbackInterface,
    projectId: string,
    target: any,
    data: any
  ) => {
    const { endpointURL, status, id } = data;
    // the action below only applies to when a bot is being started using the "start bot" button
    // a check should be added to this that ensures this ONLY applies to the "default" profile.
    if (target.name === 'default' && endpointURL) {
      set(botStatusState, BotStatus.connected);
      set(botEndpointsState, (botEndpoints) => ({
        ...botEndpoints,
        [projectId]: `${endpointURL}/api/messages`,
      }));
    }

    const publishHistory = await snapshot.getPromise(publishHistoryState);
    const history = { ...data, target: target };
    const historys = publishHistory[target.name];
    let tempHistorys = historys ? [...historys] : [];
    // if no history exists, create one with the latest status
    // otherwise, replace the latest publish history with this one
    if (!historys && status !== 404) {
      tempHistorys = [history];
    } else if (status !== 404) {
      // make sure this status payload represents the same item as item 0 (most of the time)
      // otherwise, prepend it to the list to indicate a NEW publish has occurred since last loading history
      if (tempHistorys.length && tempHistorys[0].id === id) {
        tempHistorys.splice(0, 1, history);
      } else {
        tempHistorys.unshift(history);
      }
    }
    set(publishHistoryState, (publishHistory) => ({
      ...publishHistory,
      [target.name]: tempHistorys,
    }));
  };

  const getPublishTargetTypes = useRecoilCallback((callbackHelpers: CallbackInterface) => async () => {
    const { set } = callbackHelpers;
    try {
      const response = await httpClient.get(`/publish/types`);
      set(publishTypesState, response.data);
    } catch (err) {
      //TODO: error
      logMessage(callbackHelpers, err.message);
    }
  });

  const publishToTarget = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectId: string, target: any, metadata, sensitiveSettings) => {
      try {
        const response = await httpClient.post(`/publish/${projectId}/publish/${target.name}`, {
          metadata,
          sensitiveSettings,
        });
        await publishSuccess(callbackHelpers, projectId, response.data, target);
      } catch (err) {
        // special case to handle dotnet issues
        if (
          /(Command failed: dotnet user-secrets)|(install[\w\r\s\S\t\n]*\.NET Core SDK)/.test(
            err.response?.data?.message as string
          )
        ) {
          const error = {
            message: formatMessage('To run this bot, Composer needs .NET Core SDK.'),
            linkAfterMessage: {
              text: formatMessage('Learn more.'),
              url: 'https://docs.microsoft.com/en-us/composer/setup-yarn',
            },
            link: {
              text: formatMessage('Install Microsoft .NET Core SDK'),
              url: 'https://dotnet.microsoft.com/download/dotnet-core/3.1',
            },
          };

          await publishFailure(callbackHelpers, Text.DOTNETFAILURE, error, target);
        } else {
          await publishFailure(callbackHelpers, Text.CONNECTBOTFAILURE, err.response?.data, target);
        }
      }
    }
  );

  const rollbackToVersion = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectId: string, target: any, version, sensitiveSettings) => {
      try {
        const response = await httpClient.post(`/publish/${projectId}/rollback/${target.name}`, {
          version,
          sensitiveSettings,
        });
        await publishSuccess(callbackHelpers, projectId, response.data, target);
      } catch (err) {
        await publishFailure(callbackHelpers, Text.CONNECTBOTFAILURE, err.response.data, target);
      }
    }
  );

  // get bot status from target publisher
  const getPublishStatus = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectId: string, target: any) => {
      try {
        const response = await httpClient.get(`/publish/${projectId}/status/${target.name}`);
        updatePublishStatus(callbackHelpers, projectId, target, response.data);
      } catch (err) {
        updatePublishStatus(callbackHelpers, projectId, target, err.response.data);
      }
    }
  );

  const getPublishHistory = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectId: string, target: any) => {
      const { set } = callbackHelpers;
      try {
        await filePersistence.flush();
        const response = await httpClient.get(`/publish/${projectId}/history/${target.name}`);
        set(publishHistoryState, (publishHistory) => ({
          ...publishHistory,
          [target.name]: response.data,
        }));
      } catch (err) {
        //TODO: error
        logMessage(callbackHelpers, err.message);
      }
    }
  );

  return {
    getPublishTargetTypes,
    publishToTarget,
    rollbackToVersion,
    getPublishStatus,
    getPublishHistory,
  };
};
