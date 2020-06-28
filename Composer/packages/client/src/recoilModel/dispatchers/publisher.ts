// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import formatMessage from 'format-message';
import { CallbackInterface, useRecoilCallback } from 'recoil';

import {
  publishTypesState,
  botStatusState,
  botEndpointsState,
  publishHistoryState,
  botLoadErrorState,
} from '../atoms/botState';
import filePersistence from '../../store/persistence/FilePersistence';

import { BotStatus, Text } from './../../constants/index';
import httpClient from './../../utils/httpUtil';

export const publisherDispatcher = () => {
  const publishFailure = async ({ set, snapshot }: CallbackInterface, title: string, error, target) => {
    if (target.name === 'default') {
      set(botStatusState, BotStatus.failed);
      set(botLoadErrorState, { ...error, title });
    }
    const publishHistory = await snapshot.getPromise(publishHistoryState);
    // prepend the latest publish results to the history
    if (!publishHistory[target.name]) {
      publishHistory[target.name] = [];
    }
    publishHistory[target.name].unshift(error);
    set(publishHistoryState, publishHistory);
  };

  const publishSuccess = async ({ set, snapshot }: CallbackInterface, projectId: string, data, target) => {
    const { endpointURL } = data;
    if (target.name === 'default' && endpointURL) {
      const botEndpoints = await snapshot.getPromise(botEndpointsState);

      botEndpoints[projectId] = `${endpointURL}/api/messages`;
      set(botStatusState, BotStatus.connected);
      set(botEndpointsState, botEndpoints);
    }

    const publishHistory = await snapshot.getPromise(publishHistoryState);
    // prepend the latest publish results to the history
    if (!publishHistory[target.name]) {
      publishHistory[target.name] = [];
    }
    publishHistory[target.name].unshift({
      ...data,
      target: target,
    });

    set(publishHistoryState, publishHistory);
    set(publishTypesState, data);
  };

  const getPublishTargetTypes = useRecoilCallback<[], Promise<void>>(({ set }: CallbackInterface) => async () => {
    try {
      const response = await httpClient.get(`/publish/types`);
      set(publishTypesState, response.data);
    } catch (err) {
      //TODO: error
      console.log(err);
    }
  });

  const publishToTarget = useRecoilCallback<[string, any, any, any], Promise<void>>(
    (callbackHelpers: CallbackInterface) => async (projectId, target, metadata, sensitiveSettings) => {
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
          await publishFailure(callbackHelpers, Text.CONNECTBOTFAILURE, err.response.data, target);
        }
      }
    }
  );

  const rollbackToVersion = useRecoilCallback<[string, any, any, any], Promise<void>>(
    (callbackHelpers: CallbackInterface) => async (projectId, target, version, sensitiveSettings) => {
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
  const getPublishStatus = useRecoilCallback<[string, any], Promise<void>>(
    (callbackHelpers: CallbackInterface) => async (projectId, target) => {
      try {
        const response = await httpClient.get(`/publish/${projectId}/status/${target.name}`);
        const { set, snapshot } = callbackHelpers;
        const { endpointURL, status, id } = response.data;
        // the action below only applies to when a bot is being started using the "start bot" button
        // a check should be added to this that ensures this ONLY applies to the "default" profile.
        if (target.name === 'default' && endpointURL) {
          const botEndpoints = await snapshot.getPromise(botEndpointsState);

          botEndpoints[projectId] = `${endpointURL}/api/messages`;
          set(botStatusState, BotStatus.connected);
          set(botEndpointsState, botEndpoints);
        }

        const publishHistory = await snapshot.getPromise(publishHistoryState);
        const history = { ...response.data, target: target };
        // if no history exists, create one with the latest status
        // otherwise, replace the latest publish history with this one
        if (!publishHistory[target.name] && status !== 404) {
          publishHistory[target.name] = [history];
        } else if (status !== 404) {
          // make sure this status payload represents the same item as item 0 (most of the time)
          // otherwise, prepend it to the list to indicate a NEW publish has occurred since last loading history
          if (publishHistory[target.name].length && publishHistory[target.name][0].id === id) {
            publishHistory[target.name][0] = history;
          } else {
            publishHistory[target.name].unshift(history);
          }
        }
        set(publishHistoryState, publishHistory);
      } catch (err) {
        //TODO: error
        console.log(err);
      }
    }
  );

  const getPublishHistory = useRecoilCallback<[string, any], Promise<void>>(
    ({ set, snapshot }: CallbackInterface) => async (projectId, target) => {
      try {
        await filePersistence.flush();
        const response = await httpClient.get(`/publish/${projectId}/history/${target.name}`);
        const publishHistory = await snapshot.getPromise(publishHistoryState);
        publishHistory[target.name] = response.data;
        set(publishHistoryState, publishHistory);
      } catch (err) {
        //TODO: error
        console.log(err);
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
