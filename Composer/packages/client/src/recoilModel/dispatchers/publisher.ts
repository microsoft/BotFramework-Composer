// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import formatMessage from 'format-message';
import { CallbackInterface, useRecoilCallback } from 'recoil';
import { defaultPublishConfig } from '@bfc/shared';

import {
  publishTypesState,
  botStatusState,
  publishHistoryState,
  botLoadErrorState,
  isEjectRuntimeExistState,
  filePersistenceState,
} from '../atoms/botState';
import { botEndpointsState } from '../atoms';

import { BotStatus, Text } from './../../constants';
import httpClient from './../../utils/httpUtil';
import { logMessage, setError } from './shared';

const PUBLISH_SUCCESS = 200;
const PUBLISH_PENDING = 202;
const PUBLISH_FAILED = 500;

export const publisherDispatcher = () => {
  const publishFailure = async ({ set }: CallbackInterface, title: string, error, target, projectId: string) => {
    if (target.name === defaultPublishConfig.name) {
      set(botStatusState(projectId), BotStatus.failed);
      set(botLoadErrorState(projectId), { ...error, title });
    }
    // prepend the latest publish results to the history

    set(publishHistoryState(projectId), (publishHistory) => {
      const targetHistory = publishHistory[target.name] ?? [];
      return {
        ...publishHistory,
        [target.name]: [error, ...targetHistory],
      };
    });
  };

  const publishSuccess = async ({ set }: CallbackInterface, projectId: string, data, target) => {
    const { endpointURL, status } = data;
    if (target.name === defaultPublishConfig.name) {
      if (status === PUBLISH_SUCCESS && endpointURL) {
        set(botStatusState(projectId), BotStatus.connected);
        set(botEndpointsState, (botEndpoints) => ({ ...botEndpoints, [projectId]: `${endpointURL}/api/messages` }));
      } else {
        set(botStatusState(projectId), BotStatus.reloading);
      }
    }

    set(publishHistoryState(projectId), (publishHistory) => {
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
  };

  const updatePublishStatus = ({ set }: CallbackInterface, projectId: string, target: any, data: any) => {
    const { endpointURL, status, id } = data;
    // the action below only applies to when a bot is being started using the "start bot" button
    // a check should be added to this that ensures this ONLY applies to the "default" profile.
    if (target.name === defaultPublishConfig.name) {
      if (status === PUBLISH_SUCCESS && endpointURL) {
        set(botStatusState(projectId), BotStatus.connected);
        set(botEndpointsState, (botEndpoints) => ({
          ...botEndpoints,
          [projectId]: `${endpointURL}/api/messages`,
        }));
      } else if (status === PUBLISH_PENDING) {
        set(botStatusState(projectId), BotStatus.reloading);
      } else if (status === PUBLISH_FAILED) {
        set(botStatusState(projectId), BotStatus.failed);
        set(botLoadErrorState(projectId), { ...data, title: formatMessage('Start bot failed') });
      }
    }

    if (status !== 404) {
      set(publishHistoryState(projectId), (publishHistory) => {
        const currentHistory = { ...data, target: target };
        let targetHistories = publishHistory[target.name] ? [...publishHistory[target.name]] : [];
        // if no history exists, create one with the latest status
        // otherwise, replace the latest publish history with this one
        if (!targetHistories) {
          targetHistories = [currentHistory];
        } else {
          // make sure this status payload represents the same item as item 0 (most of the time)
          // otherwise, prepend it to the list to indicate a NEW publish has occurred since last loading history
          if (targetHistories.length && targetHistories[0].id === id) {
            targetHistories[0] = currentHistory;
          } else {
            targetHistories.unshift(currentHistory);
          }
        }
        return { ...publishHistory, [target.name]: targetHistories };
      });
    }
  };

  const getPublishTargetTypes = useRecoilCallback((callbackHelpers: CallbackInterface) => async (projectId: string) => {
    const { set } = callbackHelpers;
    try {
      const response = await httpClient.get(`/publish/types`);
      set(publishTypesState(projectId), response.data);
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

          await publishFailure(callbackHelpers, Text.DOTNETFAILURE, error, target, projectId);
        } else {
          await publishFailure(callbackHelpers, Text.CONNECTBOTFAILURE, err.response?.data, target, projectId);
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
        await publishFailure(callbackHelpers, Text.CONNECTBOTFAILURE, err.response.data, target, projectId);
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
      const { set, snapshot } = callbackHelpers;
      try {
        const filePersistence = await snapshot.getPromise(filePersistenceState(projectId));
        filePersistence.flush();
        const response = await httpClient.get(`/publish/${projectId}/history/${target.name}`);
        set(publishHistoryState(projectId), (publishHistory) => ({
          ...publishHistory,
          [target.name]: response.data,
        }));
      } catch (err) {
        //TODO: error
        logMessage(callbackHelpers, err.response?.data?.message || err.message);
      }
    }
  );

  const setEjectRuntimeExist = useRecoilCallback(
    ({ set }: CallbackInterface) => async (isExist: boolean, projectId: string) => {
      set(isEjectRuntimeExistState(projectId), isExist);
    }
  );

  // only support local publish
  const stopPublishBot = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectId: string, target: any = defaultPublishConfig) => {
      const { set } = callbackHelpers;
      try {
        await httpClient.post(`/publish/${projectId}/stopPublish/${target.name}`);
        set(botStatusState(projectId), BotStatus.unConnected);
      } catch (err) {
        setError(callbackHelpers, err);
        logMessage(callbackHelpers, err.message);
      }
    }
  );

  return {
    getPublishTargetTypes,
    publishToTarget,
    stopPublishBot,
    rollbackToVersion,
    getPublishStatus,
    getPublishHistory,
    setEjectRuntimeExist,
  };
};
