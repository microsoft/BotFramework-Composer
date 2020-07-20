// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import axios from 'axios';
import { pluginLoader, PluginLoader } from '@bfc/plugin-loader';

import { BotProjectService } from '../services/project';

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
    if (!req.body || !req.body.accessToken) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const user = await PluginLoader.getUserFromRequest(req);
    const { type } = req.body;

    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);
    // deal with publishTargets not exist in settings
    // const publishTargets = currentProject.settings?.publishTargets || [];

    if (pluginLoader?.extensions?.publish[type]?.methods?.provision) {
      // get the externally defined method
      const pluginMethod = pluginLoader.extensions.publish[type].methods.provision;

      try {
        // call the method
        const result = await pluginMethod.call(
          null,
          {
            ...req.body,
            graphToken: process.env.graphToken,
          },
          currentProject,
          user
        );
        // set status and return value as json
        res.status(result.status);
      } catch (err) {
        console.log(err);
        res.status(400).json({
          statusCode: '400',
          message: err.message,
        });
      }
    }
  },
  getProvisionStatus: async (req, res) => {},
};
