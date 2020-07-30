// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import axios from 'axios';
import { pluginLoader, PluginLoader } from '@bfc/plugin-loader';

import { BotProjectService } from '../services/project';

const defaultPublishConfig = {
  name: 'default',
  type: 'localpublish',
  provisionConfig: '',
  configuration: JSON.stringify({}),
};

export const ProvisionController = {
  // get all subscriptions for current user
  getSubscriptions: async (req, res) => {
    if (!req.body || !req.body.accessToken) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const result = await axios.get('https://management.azure.com/subscriptions?api-version=2020-01-01', {
      headers: { Authorization: `Bearer ${req.body.accessToken}` },
    });
    res.status(200).json(result.data);
  },
  getResourceGroups: async (req, res) => {
    if (!req.body || !req.body.accessToken) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const result = await axios.get(
      `https://management.azure.com/subscriptions/${req.params.subscriptionId}/resourcegroups?api-version=2019-10-01`,
      {
        headers: { Authorization: `Bearer ${req.body.accessToken}` },
      }
    );
    res.status(200).json(result.data);
  },
  getResourceByResourceGroup: async (req, res) => {
    if (!req.body || !req.body.accessToken) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const result = await axios.get(
      `https://management.azure.com/subscriptions/${req.params.subscriptionId}/resourceGroups/${req.params.resourceGroup}/resources?api-version=2019-10-01`,
      {
        headers: { Authorization: `Bearer ${req.body.accessToken}` },
      }
    );
    res.status(200).json(result.data);
  },
  getDeployLocations: async (req, res) => {
    if (!req.body || !req.body.accessToken) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const result = await axios.get(
      `https://management.azure.com/subscriptions/${req.params.subscriptionId}/locations?api-version=2019-10-01`,
      {
        headers: { Authorization: `Bearer ${req.body.accessToken}` },
      }
    );
    res.status(200).json(result.data);
  },
  provision: async (req, res) => {
    if (!req.body || !req.body.accessToken || !req.body.graphToken) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    // const user = await PluginLoader.getUserFromRequest(req);
    const { type } = req.body; // type is webapp or functions
    // const projectId = req.params.projectId;
    // const currentProject = await BotProjectService.getProjectById(projectId, user);
    // deal with publishTargets not exist in settings
    // const publishTargets = currentProject.settings?.publishTargets || [];

    if (pluginLoader?.extensions?.publish[type]?.methods?.provision) {
      // get the externally provision method
      // const pluginMethod = pluginLoader.extensions.publish[type].methods.provision;

      try {
        // // call the method
        // const result = await pluginMethod.call(null, req.body, currentProject, user);
        // // set status and return value as json
        // res.status(result.status).json({
        //   config: result.config,
        //   details: result.details,
        // });
        res.status(202).json({
          config: null,
          details: {},
        });
      } catch (err) {
        console.log(err);
        res.status(400).json({
          statusCode: '400',
          message: err.message,
        });
      }
    }
  },
  getProvisionStatus: async (req, res) => {
    const target = req.params.target;
    const user = await PluginLoader.getUserFromRequest(req);
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);

    const publishTargets = currentProject.settings?.publishTargets || [];
    const allTargets = [defaultPublishConfig, ...publishTargets];

    const profiles = allTargets.filter((t) => t.name === target);
    const profile = profiles.length ? profiles[0] : undefined;

    const method = profile ? profile.type : undefined;

    if (pluginLoader?.extensions?.publish[method]?.methods?.getProvisionStatus) {
      // get the externally defined method
      // const pluginMethod = pluginLoader.extensions.publish[method].methods.getProvisionStatus;
      // const provisionConfig = profile.provisionConfig || '{}';
      try {
        // call the method
        // const result = await pluginMethod.call(null, JSON.parse(provisionConfig), currentProject, user);
        // // set status and return value as json
        // res.status(result.status).json({
        //   config: result.config || null,
        //   details: result.details || {},
        // });
        res.status(200).json({
          config: {
            settings: { applicationInsights: {}, cosmosDb: {}, blobStorage: {}, luis: {} },
            name: 'testprovisionss',
            luisResource: '',
          },
          details: {
            resourceGroupStatus: 'DEPLOY_SUCCESS',
            luisAuthoringStatus: 'NOT_DEPLOYMENT',
            luisStatus: 'NOT_DEPLOYMENT',
            appInsightsStatus: 'NOT_DEPLOYMENT',
            cosmosDBStatus: 'NOT_DEPLOYMENT',
            blobStorageStatus: 'NOT_DEPLOYMENT',
            webAppStatus: 'DEPLOY_SUCCESS',
            botStatus: 'DEPLOY_SUCCESS',
          },
        });
      } catch (err) {
        console.log(err);
        res.status(400).json({
          statusCode: '400',
          message: err.message,
        });
      }
    }
  },
};
