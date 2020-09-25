// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

// import { getAccessTokenInCache, loginPopup, getGraphTokenInCache } from '../../utils/auth';

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';

export interface Subscription {
  subscriptionId: string;
  tenantId: string;
  displayName: string;
}

export interface ResourceGroups {
  name: string;
  type: string;
  location: string;
  id: string;
  properties: any;
}

export interface Resource {
  name: string;
  id: string;
  type: string;
  location: string;
  kind?: string;
  [key: string]: any;
}

export interface DeployLocation {
  id: string;
  name: string;
  displayName: string;
}
// TODO: this should come from the plugin wrapper
const BASEURL = '/api';

const httpClient = axios.create({
  baseURL: BASEURL,
});

export default httpClient;

export const getSubscriptions = async (token: string) => {
  try {
    const result = await httpClient.get('/azure/subscriptions', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('successfully loaded subscriptions');
    // TODO: have to do error handling because Azure api could return non-success
    return result.data.value;
  } catch (error) {
    console.log(error.response.data);
    alert(error.response.data.error.message);
    // // popup window to login
    // if (error.response.data.redirectUri) {
    //   // await loginPopup();
    //   // TODO: Fix this
    //   alert('NOT LOGGED IN');
    // }
    // save token in localStorage
  }
};

export const getResourceGroups = async (token: string, subscriptionId: string) => {
  try {
    console.log(token);
    const result = await httpClient.get(`/azure/resourceGroups/${subscriptionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(result.data);
    return result.data.value;
  } catch (error) {
    console.log(error.response.data);
    // popup window to login
    if (error.response.data.redirectUri) {
      // await loginPopup();
      // TODO: Fix this
      alert('NOT LOGGED IN');
    }
  }
};

// get resources by resource group
export const getResources = async (token: string, subscriptionId: string, resourceGroup: string) => {
  try {
    console.log(token);
    const result = await httpClient.get(`/azure/resources/${subscriptionId}/${resourceGroup}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(result.data);
    return result.data.value;
  } catch (error) {
    console.log(error.response.data);
    // popup window to login
    if (error.response.data.redirectUri) {
      // await loginPopup();
      // TODO: Fix this
      alert('NOT LOGGED IN');
    }
  }
};

export const getDeployLocations = async (token: string, subscriptionId: string) => {
  try {
    console.log(token);
    const result = await httpClient.get(`/azure/locations/${subscriptionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(result.data);
    return result.data.value;
  } catch (error) {
    console.log(error.response.data);
    // popup window to login
    if (error.response.data.redirectUri) {
      // await loginPopup();
      // TODO: Fix this
      alert('NOT LOGGED IN');
    }
  }
};

export const provisionToTarget = async (
  token: string,
  graphToken: string,
  config: any,
  type: string,
  projectId: string
) => {
  try {
    const result = await httpClient.post(
      `/azure/provision/${projectId}/${type}`,
      // TODO: do not send access token as part of body if sending as part of header
      { ...config, accessToken: token, graphToken: graphToken },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log(result.data);

    // TODO: Figure out return type or next action!
    return result.data;
  } catch (error) {
    console.log(error.response.data);
  }
};

export const getProvisionStatus = async (projectId: string, target: any) => {
  // const timer = setInterval(async () => {
  //   try {
  //     const response = await httpClient.get(`/azure/provisionStatus/${projectId}/${target.name}`);
  //     console.log(response.data);
  //     if (response.data.config && response.data.config != {}) {
  //       clearInterval(timer);
  //       // update publishConfig
  //       set(settingsState(projectId), (settings) => {
  //         settings.publishTargets = settings.publishTargets?.map((item) => {
  //           if (item.name === target.name) {
  //             return {
  //               ...item,
  //               configuration: JSON.stringify(response.data.config, null, 2),
  //               provisionStatus: JSON.stringify(response.data.details, null, 2),
  //             };
  //           } else {
  //             return item;
  //           }
  //         });
  //         return settings;
  //       });
  //     } else {
  //       // update provision status
  //       set(settingsState(projectId), (settings) => {
  //         settings.publishTargets = settings.publishTargets?.map((item) => {
  //           if (item.name === target.name) {
  //             return {
  //               ...item,
  //               provisionStatus: JSON.stringify(response.data.details, null, 2),
  //             };
  //           } else {
  //             return item;
  //           }
  //         });
  //         return settings;
  //       });
  //     }
  //   } catch (err) {
  //     console.log(err.response);
  //     // remove that publishTarget
  //     set(settingsState(projectId), (settings) => {
  //       settings.publishTargets = settings.publishTargets?.filter((item) => item.name !== target.name);
  //       return settings;
  //     });
  //     clearInterval(timer);
  //   }
  // }, 10000);
};
