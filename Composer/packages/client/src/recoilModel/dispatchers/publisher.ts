// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import formatMessage from 'format-message';
import { CallbackInterface, useRecoilCallback } from 'recoil';
import { defaultPublishConfig, isSkillHostUpdateRequired, PublishResult } from '@bfc/shared';

import {
  publishTypesState,
  botStatusState,
  publishHistoryState,
  botRuntimeErrorState,
  isEjectRuntimeExistState,
  filePersistenceState,
  settingsState,
  luFilesState,
  qnaFilesState,
} from '../atoms/botState';
import { openInEmulator } from '../../utils/navigation';
import { botEndpointsState } from '../atoms';
import { rootBotProjectIdSelector, dialogsSelectorFamily } from '../selectors';
import * as luUtil from '../../utils/luUtil';

import { BotStatus, Text } from './../../constants';
import httpClient from './../../utils/httpUtil';
import { logMessage, setError } from './shared';
import { setRootBotSettingState } from './setting';

const PUBLISH_SUCCESS = 200;
const PUBLISH_PENDING = 202;
const PUBLISH_FAILED = 500;

const missingDotnetVersionError = {
  message: formatMessage('To run this bot, Composer needs .NET Core SDK.'),
  linkAfterMessage: {
    text: formatMessage('Learn more.'),
    url: 'https://aka.ms/install-composer',
  },
  link: {
    text: formatMessage('Install Microsoft .NET Core SDK'),
    url: 'https://dotnet.microsoft.com/download/dotnet-core/3.1',
  },
};

const checkIfDotnetVersionMissing = (err: any) => {
  return /(Command failed: dotnet user-secrets)|(install[\w\r\s\S\t\n]*\.NET Core SDK)/.test(err.message as string);
};

export const publisherDispatcher = () => {
  const publishFailure = async ({ set }: CallbackInterface, title: string, error, target, projectId: string) => {
    if (target.name === defaultPublishConfig.name) {
      set(botStatusState(projectId), BotStatus.failed);
      set(botRuntimeErrorState(projectId), { ...error, title });
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

  const publishSuccess = async ({ set }: CallbackInterface, projectId: string, data: PublishResult, target) => {
    const { endpointURL, status } = data;
    if (target.name === defaultPublishConfig.name) {
      if (status === PUBLISH_SUCCESS && endpointURL) {
        set(botStatusState(projectId), BotStatus.connected);
        set(botEndpointsState, (botEndpoints) => ({ ...botEndpoints, [projectId]: `${endpointURL}/api/messages` }));
      } else {
        set(botStatusState(projectId), BotStatus.starting);
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

  const updatePublishStatus = async (
    callbackHelpers: CallbackInterface,
    projectId: string,
    target: any,
    data: PublishResult
  ) => {
    if (data == null) return;
    const { set, snapshot } = callbackHelpers;
    const { endpointURL, status } = data;
    // the action below only applies to when a bot is being started using the "start bot" button
    // a check should be added to this that ensures this ONLY applies to the "default" profile.
    if (target.name === defaultPublishConfig.name) {
      if (status === PUBLISH_SUCCESS && endpointURL) {
        const rootBotId = await snapshot.getPromise(rootBotProjectIdSelector);
        if (rootBotId === projectId) {
          // Update the skill host endpoint
          const settings = await snapshot.getPromise(settingsState(projectId));
          if (isSkillHostUpdateRequired(settings?.skillHostEndpoint)) {
            // Update skillhost endpoint only if ngrok url not set meaning empty or localhost url
            const updatedSettings = {
              ...settings,
              skillHostEndpoint: endpointURL + '/api/skills',
            };
            setRootBotSettingState(callbackHelpers, projectId, updatedSettings);
          }
        }
        set(botStatusState(projectId), BotStatus.connected);
        set(botEndpointsState, (botEndpoints) => ({
          ...botEndpoints,
          [projectId]: `${endpointURL}/api/messages`,
        }));
      } else if (status === PUBLISH_PENDING) {
        set(botStatusState(projectId), BotStatus.starting);
      } else if (status === PUBLISH_FAILED) {
        set(botStatusState(projectId), BotStatus.failed);
        if (checkIfDotnetVersionMissing(data)) {
          set(botRuntimeErrorState(projectId), { title: Text.DOTNETFAILURE, ...missingDotnetVersionError });
          return;
        }
        set(botRuntimeErrorState(projectId), { ...data, title: formatMessage('Start bot failed') });
      }
    }

    if (status !== 404) {
      set(publishHistoryState(projectId), (publishHistory) => {
        const currentHistory = { ...data, target: target };
        let targetHistories = publishHistory[target.name] ? [...publishHistory[target.name]] : [];
        // if no history exists, create one with the latest status
        // otherwise, replace the latest publish history with this one
        if (targetHistories.length === 0) {
          targetHistories = [currentHistory];
        } else {
          // make sure this status payload represents the same item as item 0 (most of the time)
          // otherwise, prepend it to the list to indicate a NEW publish has occurred since last loading history
          if (targetHistories.length && targetHistories[0].id === data.id) {
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
    (callbackHelpers: CallbackInterface) => async (
      projectId: string,
      target: any,
      metadata: any,
      sensitiveSettings,
      token = ''
    ) => {
      try {
        const { snapshot } = callbackHelpers;
        const dialogs = await snapshot.getPromise(dialogsSelectorFamily(projectId));
        const luFiles = await snapshot.getPromise(luFilesState(projectId));
        const qnaFiles = await snapshot.getPromise(qnaFilesState(projectId));
        const referredLuFiles = luUtil.checkLuisBuild(luFiles, dialogs);
        const response = await httpClient.post(`/publish/${projectId}/publish/${target.name}`, {
          accessToken: token,
          metadata: {
            ...metadata,
            luResources: referredLuFiles.map((file) => ({ id: file.id, isEmpty: file.empty })),
            qnaResources: qnaFiles.map((file) => ({ id: file.id, isEmpty: file.empty })),
          },
          sensitiveSettings,
        });
        await publishSuccess(callbackHelpers, projectId, response.data, target);
      } catch (err) {
        // special case to handle dotnet issues
        if (checkIfDotnetVersionMissing(err?.response?.data)) {
          await publishFailure(callbackHelpers, Text.DOTNETFAILURE, missingDotnetVersionError, target, projectId);
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
  const getPublishStatusV2 = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectId: string, target: any, response: any) => {
      updatePublishStatus(callbackHelpers, projectId, target, response?.data);
    }
  );

  // get bot status from target publisher
  const getPublishStatus = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectId: string, target: any, jobId?: string) => {
      try {
        const response = await httpClient.get(`/publish/${projectId}/status/${target.name}${jobId ? '/' + jobId : ''}`);
        updatePublishStatus(callbackHelpers, projectId, target, response.data);
      } catch (err) {
        updatePublishStatus(callbackHelpers, projectId, target, err.response?.data);
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
      const { set, snapshot } = callbackHelpers;
      try {
        const currentBotStatus = await snapshot.getPromise(botStatusState(projectId));
        if (currentBotStatus !== BotStatus.failed) {
          set(botStatusState(projectId), BotStatus.stopping);
        }

        await httpClient.post(`/publish/${projectId}/stopPublish/${target.name}`);

        if (currentBotStatus !== BotStatus.failed) {
          set(botStatusState(projectId), BotStatus.inactive);
        }
      } catch (err) {
        setError(callbackHelpers, err);
        logMessage(callbackHelpers, err.message);
      }
    }
  );

  const resetBotRuntimeError = useRecoilCallback((callbackHelpers: CallbackInterface) => async (projectId: string) => {
    const { reset } = callbackHelpers;
    reset(botRuntimeErrorState(projectId));
  });

  const openBotInEmulator = useRecoilCallback((callbackHelpers: CallbackInterface) => async (projectId: string) => {
    const { snapshot } = callbackHelpers;
    const botEndpoints = await snapshot.getPromise(botEndpointsState);
    const settings = await snapshot.getPromise(settingsState(projectId));
    try {
      openInEmulator(
        botEndpoints[projectId] || 'http://localhost:3979/api/messages',
        settings.MicrosoftAppId && settings.MicrosoftAppPassword
          ? { MicrosoftAppId: settings.MicrosoftAppId, MicrosoftAppPassword: settings.MicrosoftAppPassword }
          : { MicrosoftAppPassword: '', MicrosoftAppId: '' }
      );
    } catch (err) {
      setError(callbackHelpers, err);
      logMessage(callbackHelpers, err.message);
    }
  });

  return {
    getPublishTargetTypes,
    publishToTarget,
    stopPublishBot,
    rollbackToVersion,
    getPublishStatus,
    getPublishStatusV2,
    getPublishHistory,
    setEjectRuntimeExist,
    openBotInEmulator,
    resetBotRuntimeError,
  };
};
