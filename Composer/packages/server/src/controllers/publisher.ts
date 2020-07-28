// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import merge from 'lodash/merge';
import { pluginLoader, PluginLoader } from '@bfc/plugin-loader';

import { BotProjectService } from '../services/project';
import { runtimeFolder } from '../settings/env';

const defaultPublishConfig = {
  name: 'default',
  type: 'localpublish',
  configuration: JSON.stringify({}),
};
const DEFAULT_RUNTIME = 'dotnet';
export const PublishController = {
  getTypes: async (req, res) => {
    res.json(
      Object.values(pluginLoader.extensions.publish)
        .filter((extension) => extension.plugin.name !== defaultPublishConfig.type)
        .map((extension) => {
          const { plugin, methods, schema, instructions } = extension;

          return {
            name: plugin.name,
            description: plugin.description,
            instructions: instructions,
            schema,
            features: {
              history: typeof methods.history === 'function',
              publish: typeof methods.publish === 'function',
              status: typeof methods.getStatus === 'function',
              rollback: typeof methods.rollback === 'function',
            },
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

    const profiles = allTargets.filter((t) => t.name === target);
    const profile = profiles.length ? profiles[0] : undefined;
    const method = profile ? profile.type : undefined;

    if (profile && method && pluginLoader?.extensions?.publish[method]?.methods?.publish) {
      // append config from client(like sensitive settings)
      const configuration = {
        profileName: profile.name,
        fullSettings: merge({}, currentProject.settings, sensitiveSettings),
        templatePath: path.resolve(runtimeFolder, DEFAULT_RUNTIME),
        ...JSON.parse(profile.configuration),
      };

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

    const profiles = allTargets.filter((t) => t.name === target);
    const profile = profiles.length ? profiles[0] : undefined;

    const method = profile ? profile.type : undefined;
    if (
      profile &&
      method &&
      pluginLoader.extensions.publish[method] &&
      pluginLoader.extensions.publish[method].methods &&
      pluginLoader.extensions.publish[method].methods.getStatus
    ) {
      // get the externally defined method
      const pluginMethod = pluginLoader.extensions.publish[method].methods.getStatus;

      if (typeof pluginMethod === 'function') {
        const configuration = {
          profileName: profile.name,
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

    const profiles = allTargets.filter((t) => t.name === target);
    const profile = profiles.length ? profiles[0] : undefined;

    const method = profile ? profile.type : undefined;

    if (
      profile &&
      method &&
      pluginLoader.extensions.publish[method] &&
      pluginLoader.extensions.publish[method].methods &&
      pluginLoader.extensions.publish[method].methods.history
    ) {
      // get the externally defined method
      const pluginMethod = pluginLoader.extensions.publish[method].methods.history;
      if (typeof pluginMethod === 'function') {
        const configuration = {
          profileName: profile.name,
          ...JSON.parse(profile.configuration),
        };

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
    const target = req.params.target;
    const user = await PluginLoader.getUserFromRequest(req);
    const { version, sensitiveSettings } = req.body;
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);

    // deal with publishTargets not exist in settings
    const publishTargets = currentProject.settings?.publishTargets || [];
    const allTargets = [defaultPublishConfig, ...publishTargets];

    const profiles = allTargets.filter((t) => t.name === target);
    const profile = profiles.length ? profiles[0] : undefined;
    const method = profile ? profile.type : undefined;

    if (
      profile &&
      method &&
      pluginLoader.extensions.publish[method] &&
      pluginLoader.extensions.publish[method].methods &&
      pluginLoader.extensions.publish[method].methods.rollback
    ) {
      // append config from client(like sensitive settings)
      const configuration = {
        profileName: profile.name,
        fullSettings: merge({}, currentProject.settings, sensitiveSettings),
        templatePath: path.resolve(runtimeFolder, DEFAULT_RUNTIME),
        ...JSON.parse(profile.configuration),
      };
      // get the externally defined method
      const pluginMethod = pluginLoader.extensions.publish[method].methods.rollback;
      if (typeof pluginMethod === 'function') {
        try {
          // call the method
          const results = await pluginMethod.call(null, configuration, currentProject, version, user);

          // copy status into payload for ease of access in client
          const response = {
            ...results.result,
            status: results.status,
          };

          // set status and return value as json
          return res.status(results.status).json(response);
        } catch (err) {
          return res.status(400).json({
            statusCode: '400',
            message: err.message,
          });
        }
      }
    }

    res.status(400).json({
      statusCode: '400',
      message: `${method} is not a valid publishing target type. There may be a missing plugin.`,
    });
  },
  removeLocalRuntimeData: async (req, res) => {
    const projectId = req.params.projectId;
    const profile = defaultPublishConfig;
    const method = profile.type;
    if (
      profile &&
      pluginLoader.extensions.publish[method] &&
      pluginLoader.extensions.publish[method].methods &&
      pluginLoader.extensions.publish[method].methods.stopBot
    ) {
      const pluginMethod = pluginLoader.extensions.publish[method].methods.stopBot;
      if (typeof pluginMethod === 'function') {
        try {
          await pluginMethod.call(null, projectId);
        } catch (err) {
          return res.status(400).json({
            statusCode: '400',
            message: err.message,
          });
        }
      }
    }
    if (
      profile &&
      pluginLoader.extensions.publish[method] &&
      pluginLoader.extensions.publish[method].methods &&
      pluginLoader.extensions.publish[method].methods.removeRuntimeData
    ) {
      const pluginMethod = pluginLoader.extensions.publish[method].methods.removeRuntimeData;
      if (typeof pluginMethod === 'function') {
        try {
          const result = await pluginMethod.call(null, projectId);
          return res.status(200).json({ message: result.msg });
        } catch (err) {
          return res.status(400).json({
            statusCode: '400',
            message: err.message,
          });
        }
      }
    }
    res.status(400).json({
      statusCode: '400',
      message: `${method} is not a valid publishing target type. There may be a missing plugin.`,
    });
  },
};
