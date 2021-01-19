/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { useRecoilCallback, CallbackInterface } from 'recoil';
import isArray from 'lodash/isArray';
import formatMessage from 'format-message';
import { FeatureFlagMap, FeatureFlagKey } from '@botframework-composer/types';

import TelemetryClient from '../../telemetry/TelemetryClient';
import httpClient from '../../utils/httpUtil';
import {
  storagesState,
  storageFileLoadingStatusState,
  focusedStorageFolderState,
  applicationErrorState,
  templateProjectsState,
  runtimeTemplatesState,
  featureFlagsState,
} from '../atoms/appState';
import { FileTypes } from '../../constants';
import { getExtension } from '../../utils/fileUtil';

import { logMessage } from './shared';

const projectFiles = ['bot', 'botproj'];

export const storageDispatcher = () => {
  const setStorageFileLoadingStatus = useRecoilCallback(({ set }: CallbackInterface) => (status: string) => {
    set(storageFileLoadingStatusState, status);
  });

  const fetchStorages = useRecoilCallback((callbackHelpers: CallbackInterface) => async () => {
    const { set } = callbackHelpers;
    try {
      const response = await httpClient.get(`/storages`);
      if (isArray(response.data)) {
        set(storagesState, [...response.data]);
      }
    } catch (ex) {
      // TODO: Handle exceptions
      logMessage(callbackHelpers, `Error fetching storages: ${ex}`);
    }
  });

  const updateCurrentPathForStorage = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (path: string, storageId: string) => {
      const { set } = callbackHelpers;
      try {
        const response = await httpClient.put(`/storages/currentPath`, { path, storageId });
        if (isArray(response.data)) {
          set(storagesState, [...response.data]);
        }
      } catch (ex) {
        // TODO: Handle exceptions
        logMessage(callbackHelpers, `Error updating current path for storage: ${ex}`);
      }
    }
  );

  const addNewStorage = useRecoilCallback((callbackHelpers: CallbackInterface) => async (storageData: string) => {
    const { set } = callbackHelpers;
    try {
      const response = await httpClient.post(`/storages`, storageData);
      if (isArray(response.data)) {
        set(storagesState, [...response.data]);
      }
    } catch (ex) {
      // TODO: Handle exceptions
      logMessage(callbackHelpers, `Error adding a new storages: ${ex}`);
    }
  });

  const fetchStorageByName = useRecoilCallback((callbackHelpers: CallbackInterface) => async (fileName: string) => {
    const { set } = callbackHelpers;
    try {
      const response = await httpClient.get(`/storage/${fileName}`);
      if (isArray(response.data)) {
        set(storagesState, [...response.data]);
      }
    } catch (ex) {
      // TODO: Handle exceptions
      logMessage(callbackHelpers, `Error getting storages by name: ${ex}`);
    }
  });

  const fetchFolderItemsByPath = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (id: string, path: string) => {
      const { set } = callbackHelpers;
      try {
        const response = await httpClient.get(`/storages/${id}/blobs`, { params: { path: encodeURIComponent(path) } });
        const fetchedFocusStorage = response.data;
        fetchedFocusStorage.children = fetchedFocusStorage.children.reduce((files, file) => {
          if (file.type === FileTypes.FOLDER) {
            files.push(file);
          } else if (file.type === FileTypes.BOT) {
            files.push(file);
          } else {
            const extension = getExtension(file.path);
            if (projectFiles.includes(extension)) {
              files.push(file);
            }
          }
          return files;
        }, []);
        setStorageFileLoadingStatus('success');
        set(focusedStorageFolderState, fetchedFocusStorage);
      } catch (ex) {
        // TODO: Handle exceptions
        logMessage(callbackHelpers, `Error fetching focussed storage folder: ${ex}`);
        setStorageFileLoadingStatus('failure');
      }
    }
  );

  const createFolder = useRecoilCallback<[string, string], Promise<void>>(
    ({ set }: CallbackInterface) => async (path, name) => {
      const storageId = 'default';
      try {
        await httpClient.post(`/storages/folder`, { path, name, storageId });
      } catch (err) {
        set(applicationErrorState, {
          message: err.message,
          summary: formatMessage('Create Folder Error'),
        });
      }
    }
  );

  const updateFolder = useRecoilCallback<[string, string, string], Promise<void>>(
    ({ set }: CallbackInterface) => async (path, oldName, newName) => {
      const storageId = 'default';
      try {
        await httpClient.put(`/storages/folder`, { path, oldName, newName, storageId });
      } catch (err) {
        set(applicationErrorState, {
          message: err.message,
          summary: formatMessage('Update Folder Name Error'),
        });
      }
    }
  );

  const fetchTemplates = useRecoilCallback<[], Promise<void>>((callbackHelpers: CallbackInterface) => async () => {
    try {
      const response = await httpClient.get(`/assets/projectTemplates`);

      const data = response?.data;

      if (data && Array.isArray(data) && data.length > 0) {
        callbackHelpers.set(templateProjectsState, data);
      }
    } catch (err) {
      // TODO: Handle exceptions
      logMessage(callbackHelpers, `Error fetching runtime templates: ${err}`);
    }
  });

  const fetchTemplatesV2 = useRecoilCallback(({ set }: CallbackInterface) => async (feedUrls?: string[]) => {
    try {
      const response = await httpClient.post(`v2/assets/projectTemplates`, {
        feedUrls: feedUrls,
        getFirstPartyNpm: false,
      });

      const data = response?.data;

      if (data && Array.isArray(data) && data.length > 0) {
        set(templateProjectsState, data);
      }
    } catch (err) {
      set(applicationErrorState, {
        message: err.message,
        summary: formatMessage('Error fetching runtime templates'),
      });
    }
  });

  const fetchRuntimeTemplates = useRecoilCallback<[], Promise<void>>(
    (callbackHelpers: CallbackInterface) => async () => {
      const { set } = callbackHelpers;
      try {
        const response = await httpClient.get(`/runtime/templates`);
        if (Array.isArray(response.data)) {
          set(runtimeTemplatesState, [...response.data]);
        }
      } catch (ex) {
        // TODO: Handle exceptions
        logMessage(callbackHelpers, `Error fetching runtime templates: ${ex}`);
      }
    }
  );

  const fetchFeatureFlags = useRecoilCallback<[], Promise<void>>((callbackHelpers: CallbackInterface) => async () => {
    const { set } = callbackHelpers;
    try {
      const response = await httpClient.get('/featureFlags');
      set(featureFlagsState, response.data);
    } catch (ex) {
      logMessage(callbackHelpers, `Error fetching feature flag data: ${ex}`);
    }
  });

  const toggleFeatureFlag = useRecoilCallback(
    ({ set }: CallbackInterface) => async (featureName: FeatureFlagKey, enabled: boolean) => {
      let newFeatureFlags: FeatureFlagMap = {} as FeatureFlagMap;
      // update local
      set(featureFlagsState, (featureFlagsState) => {
        newFeatureFlags = { ...featureFlagsState };
        newFeatureFlags[featureName] = { ...featureFlagsState[featureName], enabled: enabled };
        return newFeatureFlags;
      });
      // update server
      await httpClient.post(`/featureFlags`, { featureFlags: newFeatureFlags });

      TelemetryClient.track('FeatureFlagChanged', { featureFlag: featureName, enabled });
    }
  );

  return {
    fetchStorages,
    updateCurrentPathForStorage,
    addNewStorage,
    fetchStorageByName,
    fetchFolderItemsByPath,
    setStorageFileLoadingStatus,
    createFolder,
    updateFolder,
    fetchTemplates,
    fetchTemplatesV2,
    fetchRuntimeTemplates,
    fetchFeatureFlags,
    toggleFeatureFlag,
  };
};
