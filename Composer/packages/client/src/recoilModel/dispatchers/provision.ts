// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface, useRecoilCallback } from 'recoil';

import { settingsState } from '../atoms/botState';

import httpClient from './../../utils/httpUtil';

export const provisionDispatcher = () => {
  /* NOTE
     On 9/25 Ben is marking these as deprecated since the required functionality has moved into the azurePublish ui plugin.
     However I'm leaving it here just in case that was the wrong decision, and also to leave the structure of this in place
     so that we can use it for possible near term intergrations between the Composer core and the azurepublish provisioning component.
  */
  // const provisionToTarget = useRecoilCallback(
  //   ({ set }: CallbackInterface) => async (config: any, type: string, projectId: string) => {
  //     try {
  //       const token = getAccessTokenInCache();
  //       const result = await httpClient.post(
  //         `/azure/provision/${projectId}/${type}`,
  //         // TODO: do not send access token as part of body if sending as part of header
  //         { ...config, accessToken: token, graphToken: getGraphTokenInCache() },
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }
  //       );
  //       console.log(result.data);
  //       set(settingsState(projectId), (settings) => ({
  //         ...settings,
  //         provisionConfig: result.data,
  //       }));
  //     } catch (error) {
  //       console.log(error.response.data);
  //     }
  //   }
  // );

  const getProvisionStatus = useRecoilCallback(
    ({ set }: CallbackInterface) => async (projectId: string, target: any) => {
      const timer = setInterval(async () => {
        try {
          const response = await httpClient.get(`/azure/provisionStatus/${projectId}/${target.name}`);
          console.log(response.data);
          if (response.data.config && response.data.config != {}) {
            clearInterval(timer);
            // update publishConfig
            set(settingsState(projectId), (settings) => {
              settings.publishTargets = settings.publishTargets?.map((item) => {
                if (item.name === target.name) {
                  return {
                    ...item,
                    configuration: JSON.stringify(response.data.config, null, 2),
                    provisionStatus: JSON.stringify(response.data.details, null, 2),
                  };
                } else {
                  return item;
                }
              });
              return settings;
            });
          } else {
            // update provision status
            set(settingsState(projectId), (settings) => {
              settings.publishTargets = settings.publishTargets?.map((item) => {
                if (item.name === target.name) {
                  return {
                    ...item,
                    provisionStatus: JSON.stringify(response.data.details, null, 2),
                  };
                } else {
                  return item;
                }
              });
              return settings;
            });
          }
        } catch (err) {
          console.log(err.response);
          // remove that publishTarget
          set(settingsState(projectId), (settings) => {
            settings.publishTargets = settings.publishTargets?.filter((item) => item.name !== target.name);
            return settings;
          });
          clearInterval(timer);
        }
      }, 10000);
    }
  );

  return {
    getProvisionStatus,
    // provisionToTarget,
  };
};
