// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from 'path';
import axios from 'axios';
import { IExtensionRegistration } from '@botframework-composer/types';
import { SchemaMerger } from '@microsoft/bf-dialog/lib/library/schemaMerger';
import { IFeed, IPackageDefinition, IPackageQuery, IPackageSource, PackageSourceType } from './feeds/feedInterfaces';
import { FeedFactory } from './feeds/feedFactory';

const API_ROOT = '/api';

const hasSchema = (c) => {
  // NOTE: A special case for orchestrator is included here because it does not directly include the schema
  // the schema for orchestrator is in a dependent package
  // additionally, our schemamerge command only returns the top level components found, even though
  // it does properly discover and include the schema from this dependent package.
  // without this special case, composer does not see orchestrator as being installed even though it is.
  // in the future this should be resolved in the schemamerger library by causing the includesSchema property to be passed up to all parent libraries
  return c.includesSchema || c.name.toLowerCase() === 'microsoft.bot.components.orchestrator';
};

const isAdaptiveComponent = (c) => {
  return hasSchema(c) || c.includesExports;
};

export default async (composer: IExtensionRegistration): Promise<void> => {
  const updateRecentlyUsed = (componentList, runtimeLanguage) => {
    const recentlyUsed = (composer.store.read('recentlyUsed') as any[]) || [];
    componentList.forEach((component) => {
      if (!recentlyUsed.find((used) => used.name === component.name)) {
        recentlyUsed.unshift({ ...component, language: runtimeLanguage });
      }
    });
    composer.store.write('recentlyUsed', recentlyUsed);
  };

  const LibraryController = {
    getReadme: async (req: any, res: any) => {
      try {
        const moduleName = req.params.packageName;
        if (!moduleName) {
          res.status(400).json({
            message: 'missing module name on request',
          });
        } else {
          const moduleURL = 'https://registry.npmjs.org/' + moduleName;
          const raw = await axios.get(moduleURL);
          res.status(200).json(raw.data);
        }
      } catch (error) {
        res.status(error.response?.status || 400).json({
          message: error instanceof Error ? error.message : error,
        });
      }
    },
    getFeeds: async function (req, res) {
      // read the list of sources from the config file.
      let packageSources: IPackageSource[] = composer.store.read('feeds') as IPackageSource[];

      // if no sources are in the config file, set the default list to our 1st party feed.
      if (!packageSources) {
        packageSources = [
          {
            key: 'npm',
            text: 'npm',
            url: 'https://registry.npmjs.org/-/v1/search?text=keywords:bf-component&size=100&from=0',
            searchUrl: 'https://registry.npmjs.org/-/v1/search?text={{keyword}}+keywords:bf-component&size=100&from=0',
            readonly: true,
          },
          {
            key: 'nuget',
            text: 'nuget',
            url: 'https://api.nuget.org/v3/index.json',
            readonly: true,
            defaultQuery: {
              prerelease: true,
              semVerLevel: '2.0.0',
              query: 'microsoft.bot.components+tags:bf-component',
            },
            type: PackageSourceType.NuGet,
          },
        ];
        composer.store.write('feeds', packageSources);
      }

      res.json(packageSources);
    },
    updateFeeds: async function (req, res) {
      const { key, updatedItem } = req.body;

      let feeds = composer.store.read('feeds') as IPackageSource[];

      if (!updatedItem) {
        // update component state
        feeds = feeds.filter((f) => f.key !== key);
      } else if (feeds.filter((f) => f.key === key).length) {
        // item found
        feeds = feeds.map((f) => (f.key === key ? updatedItem : f));
      } else {
        // new item to be appended
        feeds = feeds.concat([updatedItem]);
      }

      composer.store.write('feeds', feeds);
      res.json(feeds);
    },
    getLibrary: async function (req, res) {
      const packageSources = (composer.settings.sources as string[]) || [
        `https://raw.githubusercontent.com/microsoft/botframework-components/main/experimental/feeds/components.json`,
      ];

      let combined = [];
      for (let s = 0; s < packageSources.length; s++) {
        const url = packageSources[s];
        try {
          composer.log('Get feed: ', url);
          const raw = await axios.get(url);
          if (Array.isArray(raw.data)) {
            combined = combined.concat(raw.data);
          } else {
            composer.log('Received non-JSON response from ', url);
          }
        } catch (err) {
          composer.log('Could not load library from URL');
          composer.log(err);
          res
            .status(err.response?.status || 500)
            .json({ message: `Could not load feed from ${url}. Please check the feed URL and format.` });
          return;
        }
      }

      // add recently used
      const recentlyUsed = (composer.store.read('recentlyUsed') as any[]) || [];

      res.json({
        available: combined,
        recentlyUsed: recentlyUsed,
      });
    },
    getFeed: async function (req, res) {
      // We receive an array of urls for the package sources to retrieve.
      // Why an array? In the future it is feasible we would want to mix several feeds together...
      const packageSourceUrls: string[] = [req.query.url];
      let packageSources: IPackageSource[] = composer.store.read('feeds') as IPackageSource[];

      // Get package sources that match a url in the feed query received.
      packageSources = packageSources.filter((f) => f.url != null && packageSourceUrls.includes(f.url));

      let combined: IPackageDefinition[] = [];
      for (const packageSource of packageSources) {
        try {
          const feed: IFeed = await new FeedFactory(composer).build(packageSource);
          const packageQuery: IPackageQuery = {
            prerelease: true,
            semVerLevel: '2.0.0',
            query: 'tags:bf-component',
          };

          const packages = await feed.getPackages(packageSource.defaultQuery ?? packageQuery);

          if (Array.isArray(packages)) {
            combined.push(...packages);
          } else {
            composer.log('Received non-JSON response from ', packageSource.url);
          }
        } catch (err) {
          composer.log(`Could not load library from URL ${packageSource.url}.`);
          composer.log(err);
          return res.status(err.response?.status || 500).json({
            message: `Could not load feed from URL ${packageSource.url}. Please check the feed URL and format. Error message: ${err.message}`,
          });
        }
      }

      const recentlyUsed = (composer.store.read('recentlyUsed') as any[]) || [];

      res.json({
        available: combined,
        recentlyUsed: recentlyUsed,
      });
    },
    getComponents: async function (req, res) {
      const user = await composer.context.getUserFromRequest(req);
      const projectId = req.params.projectId;
      const currentProject = await composer.getProjectById(projectId, user);
      const runtime = composer.getRuntimeByProject(currentProject);
      const mergeErrors: string[] = [];

      const captureErrors = (msg: string): void => {
        composer.log(msg);
        mergeErrors.push(msg);
      };

      const runtimePath = currentProject.getRuntimePath();

      if (currentProject.settings?.runtime?.customRuntime && runtimePath) {
        const manifestFile = runtime.identifyManifest(runtimePath, currentProject.name);

        const dryrun = new SchemaMerger(
          [manifestFile, '!**/imported/**', '!**/generated/**'],
          path.join(currentProject.dataDir, 'schemas/sdk'),
          path.join(currentProject.dataDir, 'dialogs/imported'),
          true, // copy only? true = dry run
          false, // verbosity: true = verbose
          composer.log,
          composer.log,
          captureErrors
        );
        const dryRunMergeResults = await dryrun.merge();

        if (dryRunMergeResults) {
          res.json({
            projectId,
            components: dryRunMergeResults.components.filter(isAdaptiveComponent),
          });
        } else {
          res.status(500).json({
            message: 'Could not load component list:' + mergeErrors.join('\n'),
          });
        }
      } else {
        res.json({
          projectId,
          components: [],
        });
      }
    },
    import: async function (req, res) {
      const user = await composer.context.getUserFromRequest(req);
      const projectId = req.params.projectId;
      const currentProject = await composer.getProjectById(projectId, user);
      const runtime = composer.getRuntimeByProject(currentProject);

      // get URL or package name
      const packageName = req.body.package;
      const version = req.body.version;
      const source = req.body.source;
      const isUpdating = req.body.isUpdating || false;
      const mergeErrors: string[] = [];

      const captureErrors = (msg: string): void => {
        composer.log(msg);
        mergeErrors.push(msg);
      };

      const runtimePath = currentProject.getRuntimePath();

      if (packageName && runtimePath) {
        try {
          // Call the runtime's component install mechanism.
          const installOutput = await runtime.installComponent(
            runtimePath,
            packageName,
            version,
            source,
            currentProject
          );

          const manifestFile = runtime.identifyManifest(runtimePath, currentProject.name);

          // call do a dry run on the dialog merge
          const dryrun = new SchemaMerger(
            [manifestFile, '!**/imported/**', '!**/generated/**'],
            path.join(currentProject.dataDir, 'schemas/sdk'),
            path.join(currentProject.dataDir, 'dialogs/imported'),
            true, // copy only? true = dry run
            false, // verbosity: true = verbose
            composer.log,
            composer.log,
            captureErrors
          );

          const dryRunMergeResults = await dryrun.merge();

          // evaluate dry run.
          // Did we have any conflicts that prevent moving forward? if so, install
          // Otherwise, copy the files into the project
          if (!dryRunMergeResults) {
            throw new Error('A problem occured during the install of this Component:\n' + mergeErrors.join('\n'));
          }

          // check the results to see if we have any problems
          if (dryRunMergeResults?.conflicts?.length && !isUpdating) {
            // we need to prompt the user to confirm the changes before proceeding
            res.json({
              success: false,
              components: dryRunMergeResults.components.filter(isAdaptiveComponent),
            });
          } else {
            const realMerge = new SchemaMerger(
              [manifestFile, '!**/imported/**', '!**/generated/**'],
              path.join(currentProject.dataDir, 'schemas/sdk'),
              path.join(currentProject.dataDir, 'dialogs/imported'),
              false, // copy only? true = dry run
              false, // verbosity: true = verbose
              composer.log,
              composer.log,
              composer.log
            );

            const mergeResults = await realMerge.merge();
            const installedComponents = mergeResults.components.filter(isAdaptiveComponent);
            if (mergeResults) {
              res.json({
                success: true,
                components: installedComponents,
              });

              let runtimeLanguage = 'c#';
              if (currentProject.settings.runtime.key === 'node-azurewebapp') {
                runtimeLanguage = 'js';
              }

              // update the settings.plugins array
              const newlyInstalledPlugin = installedComponents.find((c) => hasSchema(c) && c.name == packageName);
              if (
                newlyInstalledPlugin &&
                !currentProject.settings.runtimeSettings?.plugins?.find((p) => p.name === newlyInstalledPlugin.name)
              ) {
                const newSettings = currentProject.settings;
                if (!newSettings.runtimeSettings) {
                  newSettings.runtimeSettings = {
                    plugins: [],
                  };
                }
                newSettings.runtimeSettings.plugins.push({
                  name: newlyInstalledPlugin.name,
                  settingsPrefix: newlyInstalledPlugin.name,
                });
                currentProject.updateEnvSettings(newSettings);
              }
              updateRecentlyUsed(installedComponents, runtimeLanguage);
            } else {
              res.json({
                success: false,
                results: 'Could not merge components',
              });
            }
          }
        } catch (err) {
          composer.log('Error in import', { message: err.message });
          try {
            await runtime.uninstallComponent(runtimePath, packageName, currentProject);
          } catch (err) {
            composer.log('Error uninstalling', err);
          }
          // if packageName is in the github form <username/package> remove the first part, because otherwise the unisntall doesn't work
          if (packageName.match(/.*\/.*/)) {
            const [user, realPackageName] = packageName.split(/\//);
            if (!user.match(/^@/)) {
              await runtime.uninstallComponent(runtimePath, realPackageName, currentProject);
            }
          }
          res.status(500).json({ success: false, message: err.message });
        }
      } else if (!runtimePath) {
        res.status(500).json({ message: 'Please eject your runtime before installing a package.' });
      } else {
        res.status(500).json({ message: 'Please specify a package name or git url to import.' });
      }
    },
    removeImported: async function (req, res) {
      const user = await composer.context.getUserFromRequest(req);
      const projectId = req.params.projectId;
      const currentProject = await composer.getProjectById(projectId, user);
      const runtime = composer.getRuntimeByProject(currentProject);
      const mergeErrors: string[] = [];

      const captureErrors = (msg: string): void => {
        composer.log(msg);
        mergeErrors.push(msg);
      };

      const runtimePath = currentProject.getRuntimePath();

      // get URL or package name
      const packageName = req.body.package;
      if (packageName && runtimePath) {
        try {
          const output = await runtime.uninstallComponent(runtimePath, packageName, currentProject);

          const manifestFile = runtime.identifyManifest(runtimePath, currentProject.name);

          // call do a dry run on the dialog merge
          const merger = new SchemaMerger(
            [manifestFile, '!**/imported/**', '!**/generated/**'],
            path.join(currentProject.dataDir, 'schemas/sdk'),
            path.join(currentProject.dataDir, 'dialogs/imported'),
            false, // copy only? true = dry run
            false, // verbosity: true = verbose
            composer.log,
            composer.log,
            captureErrors
          );

          const mergeResults = await merger.merge();

          if (!mergeResults) {
            throw new Error(mergeErrors.join('\n'));
          }

          res.json({
            success: true,
            components: mergeResults.components.filter(isAdaptiveComponent),
          });

          // update the settings.plugins array
          if (currentProject.settings.runtimeSettings?.plugins?.find((p) => p.name === packageName)) {
            const newSettings = currentProject.settings;
            newSettings.runtimeSettings.plugins = newSettings.runtimeSettings.plugins.filter(
              (p) => p.name !== packageName
            );
            currentProject.updateEnvSettings(newSettings);
          }
        } catch (err) {
          res.json({
            success: false,
            message: err.message,
          });
        }
      } else {
        res.status(500).json({ message: 'Please specify a package name to remove' });
      }
    },
  };

  composer.addWebRoute('post', `${API_ROOT}/projects/:projectId/import`, LibraryController.import);
  composer.addWebRoute('post', `${API_ROOT}/projects/:projectId/unimport`, LibraryController.removeImported);
  composer.addWebRoute('get', `${API_ROOT}/projects/:projectId/installedComponents`, LibraryController.getComponents);
  composer.addWebRoute('get', `${API_ROOT}/library`, LibraryController.getLibrary);
  composer.addWebRoute('get', `${API_ROOT}/feeds`, LibraryController.getFeeds);
  composer.addWebRoute('post', `${API_ROOT}/feeds`, LibraryController.updateFeeds);
  composer.addWebRoute('get', `${API_ROOT}/feed`, LibraryController.getFeed);
  composer.addWebRoute('get', `${API_ROOT}/readme/:packageName`, LibraryController.getReadme);
};
