// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import axios from 'axios';

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
};
