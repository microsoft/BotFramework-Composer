/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { useRecoilCallback, CallbackInterface } from 'recoil';
import isArray from 'lodash/isArray';

import httpClient from '../../utils/httpUtil';
import { storagesState, storageFileLoadingStatusState, focusedStorageFolderState } from '../atoms/appState';
import { FileTypes } from '../../constants';
import { getExtension } from '../../utils/fileUtil';

import { logMessage } from './shared';

const projectFiles = ['bot', 'botproj'];

export const storageDispatcher = () => {
  const setStorageFileLoadingStatus = useRecoilCallback<[string], void>(
    ({ set }: CallbackInterface) => (status: string) => {
      set(storageFileLoadingStatusState, status);
    }
  );

  const fetchStorages = useRecoilCallback<[], Promise<void>>((callbackHelpers: CallbackInterface) => async () => {
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

  const updateCurrentPathForStorage = useRecoilCallback<[string, string], Promise<void>>(
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

  const addNewStorage = useRecoilCallback<[string, string], Promise<void>>(
    (callbackHelpers: CallbackInterface) => async (storageData) => {
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
    }
  );

  const fetchStorageByName = useRecoilCallback<[string, string], Promise<void>>(
    (callbackHelpers: CallbackInterface) => async (fileName) => {
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
    }
  );

  const fetchFolderItemsByPath = useRecoilCallback<[string, string], Promise<void>>(
    (callbackHelpers: CallbackInterface) => async (id, path) => {
      const { set } = callbackHelpers;
      try {
        const response = await httpClient.get(`/storages/${id}/blobs`, { params: { path } });
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

  return {
    fetchStorages,
    updateCurrentPathForStorage,
    addNewStorage,
    fetchStorageByName,
    fetchFolderItemsByPath,
    setStorageFileLoadingStatus,
  };
};
