/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';

import httpClient from '../../utils/httpUtil';
import { extensionsState } from '../atoms';
import { ExtensionConfig } from '../types';

export const extensionsDispatcher = () => {
  const fetchExtensions = useRecoilCallback((callbackHelpers: CallbackInterface) => async () => {
    const { set } = callbackHelpers;
    try {
      const res = await httpClient.get('/extensions');

      set(extensionsState, res.data);
    } catch (err) {
      console.error(err);
    }
  });

  const addExtension = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (extensionName: string, version?: string) => {
      const { set } = callbackHelpers;
      try {
        const res = await httpClient.post('/extensions', { id: extensionName, version });
        const addedExtension: ExtensionConfig = res.data;

        set(extensionsState, (extensions) => {
          if (extensions.find((p) => p.id === addedExtension.id)) {
            return extensions.map((p) => {
              if (p.id === addedExtension.id) {
                return addedExtension;
              }
              return p;
            });
          } else {
            return [...extensions, addedExtension];
          }
        });
      } catch (err) {
        console.error(err);
      }
    }
  );

  const removeExtension = useRecoilCallback((callbackHelpers: CallbackInterface) => async (extensionName: string) => {
    const { set } = callbackHelpers;
    try {
      const res = await httpClient.delete('/extensions', { data: { id: extensionName } });

      set(extensionsState, res.data);
    } catch (err) {
      console.error(err);
    }
  });

  const toggleExtension = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (extensionId: string, enabled: boolean) => {
      const { set } = callbackHelpers;
      try {
        const res = await httpClient.patch('/extensions/toggle', {
          id: extensionId,
          enabled: Boolean(enabled),
        });
        const toggledExtension: ExtensionConfig = res.data;

        set(extensionsState, (extensions) => {
          return (extensions = extensions.map((p) => {
            if (p.id === toggledExtension.id) {
              // update the toggled extension
              return toggledExtension;
            }
            return p;
          }));
        });
      } catch (err) {
        // do nothing
        console.error(err);
      }
    }
  );

  return {
    fetchExtensions,
    addExtension,
    removeExtension,
    toggleExtension,
  };
};
