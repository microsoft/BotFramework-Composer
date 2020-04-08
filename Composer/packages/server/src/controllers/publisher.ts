// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import merge from 'lodash/merge';

import { pluginLoader, PluginLoader } from '../services/pluginLoader';
import { BotProjectService } from '../services/project';
import { runtimeFolder } from '../settings/env';
const defaultPublishConfig = {
  name: 'default',
  type: 'localpublish',
  configuration: JSON.stringify({}),
};
const DEFAULT_RUNTIME = 'CSharp';
export const PublishController = {
  getTypes: async (req, res) => {
    res.json(
      Object.keys(pluginLoader.extensions.publish).map(i => {
        return {
          name: pluginLoader.extensions.publish[i].plugin.name,
          description: pluginLoader.extensions.publish[i].plugin.description,
        };
      })
    );
  },
  publish: async (req, res) => {
    const target = req.params.target;
    const user = await PluginLoader.getUserFromRequest(req);
    const { metadata, sensitiveSettings } = req.body;
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);

    // deal with publishTargets not exist in settings
    const publishTargets = currentProject.settings?.publishTargets || [];
    const allTargets = [defaultPublishConfig, ...publishTargets];

    const profiles = allTargets.filter(t => t.name === target);
    const profile = profiles.length ? profiles[0] : undefined;
    const method = profile ? profile.type : undefined;

    // append config from client(like sensitive settings)
    const configuration = {
      name: profile.name,
      ...JSON.parse(profile.configuration),
      settings: merge({}, currentProject.settings, sensitiveSettings),
      templatePath: path.resolve(runtimeFolder, DEFAULT_RUNTIME),
    };

    if (
      profile &&
      pluginLoader.extensions.publish[method] &&
      pluginLoader.extensions.publish[method].methods &&
      pluginLoader.extensions.publish[method].methods.publish
    ) {
      // get the externally defined method
      const pluginMethod = pluginLoader.extensions.publish[method].methods.publish;

      try {
        // call the method
        const results = await pluginMethod.call(null, configuration, currentProject, metadata, user);

        // copy status into payload for ease of access in client
        const response = {
          ...results.result,
          status: results.status,
        };

        // set status and return value as json
        res.status(results.status).json(response);
      } catch (err) {
        res.status(400).json({
          statusCode: '400',
          message: err.message,
        });
      }
    } else {
      res.status(400).json({
        statusCode: '400',
        message: `${method} is not a valid publishing target type. There may be a missing plugin.`,
      });
    }
  },
  status: async (req, res) => {
    const target = req.params.target;
    const user = await PluginLoader.getUserFromRequest(req);
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);

    const publishTargets = currentProject.settings?.publishTargets || [];
    const allTargets = [defaultPublishConfig, ...publishTargets];

    const profiles = allTargets.filter(t => t.name === target);
    const profile = profiles.length ? profiles[0] : undefined;

    const method = profile ? profile.type : undefined;
    console.log(method);
    if (
      profile &&
      pluginLoader.extensions.publish[method] &&
      pluginLoader.extensions.publish[method].methods &&
      pluginLoader.extensions.publish[method].methods.getStatus
    ) {
      // get the externally defined method
      const pluginMethod = pluginLoader.extensions.publish[method].methods.getStatus;

      if (typeof pluginMethod === 'function') {
        const configuration = {
          name: profile.name,
          ...JSON.parse(profile.configuration),
        };

        // call the method
        const results = await pluginMethod.call(null, configuration, currentProject, user);
        // copy status into payload for ease of access in client
        const response = {
          ...results.result,
          status: results.status,
        };

        // set status and return value as json
        return res.status(results.status).json(response);
      }
    }

    res.status(400).json({
      statusCode: '400',
      message: `${method} is not a valid publishing target type. There may be a missing plugin.`,
    });
  },
  history: async (req, res) => {
    const target = req.params.target;
    const user = await PluginLoader.getUserFromRequest(req);
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);

    const publishTargets = currentProject.settings?.publishTargets || [];
    const allTargets = [defaultPublishConfig, ...publishTargets];

    const profiles = allTargets.filter(t => t.name === target);
    const profile = profiles.length ? profiles[0] : undefined;

    const method = profile ? profile.type : undefined;

    const configuration = {
      name: profile.name,
      ...JSON.parse(profile.configuration),
    };

    if (
      profile &&
      pluginLoader.extensions.publish[method] &&
      pluginLoader.extensions.publish[method].methods &&
      pluginLoader.extensions.publish[method].methods.history
    ) {
      // get the externally defined method
      const pluginMethod = pluginLoader.extensions.publish[method].methods.history;
      if (typeof pluginMethod === 'function') {
        // call the method
        const results = await pluginMethod.call(null, configuration, currentProject, user);

        // set status and return value as json
        return res.status(200).json(results);
      }
    }

    res.status(400).json({
      statusCode: '400',
      message: `${method} is not a valid publishing target type. There may be a missing plugin.`,
    });
  },
  rollback: async (req, res) => {
    // TODO
  },
};
