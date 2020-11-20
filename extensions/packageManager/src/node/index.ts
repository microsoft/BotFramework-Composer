// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from 'path';
import axios from 'axios';
import { IExtensionRegistration } from '@botframework-composer/types';

import { SchemaMerger } from '@microsoft/bf-dialog/lib/library/schemaMerger';

const API_ROOT = '/api';

export default async (composer: IExtensionRegistration): Promise<void> => {

  const updateRecentlyUsed = (componentList, runtimeLanguage) => {
    const recentlyUsed = composer.store.read('recentlyUsed') as any[] || [];
    componentList.forEach((component) => {
      if (!recentlyUsed.find((used) => used.name === component.name)) {
        recentlyUsed.unshift({...component, language: runtimeLanguage });
      }
    });
    composer.store.write('recentlyUsed', recentlyUsed);
  }

  const LibraryController = {
    getLibrary: async function (req, res) {
      // read the list of sources from the config file.
      let packageSources = composer.store.read('sources') as string[];

      // if no sources are in the config file, set the default list to our 1st party feed.
      if (!packageSources) {
        packageSources = [
          `https://raw.githubusercontent.com/microsoft/botframework-components/main/experimental/feeds/components.json`,
        ];
        composer.store.write('sources', packageSources);
      }

      let combined = [];
      for (let s = 0; s < packageSources.length; s++) {
        const url = packageSources[s];
        try {
          const raw = await axios.get(url);
          if (Array.isArray(raw.data)) {
            combined = combined.concat(raw.data);
          } else {
            composer.log('Received non-JSON response from ', url);
          }
        } catch (err) {
          composer.log('Could not load library from URL');
          composer.log(err);
        }
      }

      // add recently used
      const recentlyUsed = composer.store.read('recentlyUsed') as any[] || [];

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

      if (currentProject.settings?.runtime?.customRuntime && currentProject.settings?.runtime?.path) {
        const manifestFile = runtime.identifyManifest(currentProject.settings?.runtime?.path);

        const dryrun = new SchemaMerger(
          [manifestFile],
          '',
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
            components: dryRunMergeResults.components.filter((c) => c.includesSchema || c.includesExports),
          });
        } else {
          res.status(500).json({
            message: 'Could not load component list:' + mergeErrors.join('\n'),
          });
        }
      } else {
        res.json({
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
      const isUpdating = req.body.isUpdating || false;
      const mergeErrors: string[] = [];

      const captureErrors = (msg: string): void => {
        composer.log(msg);
        mergeErrors.push(msg);
      };

      if (packageName && currentProject.settings?.runtime?.path) {
        try {
          // Call the runtime's component install mechanism.
          const installOutput = await runtime.installComponent(
            currentProject.settings?.runtime?.path || '',
            packageName,
            version
          );

          const manifestFile = runtime.identifyManifest(currentProject.settings?.runtime?.path);

          // call do a dry run on the dialog merge
          const dryrun = new SchemaMerger(
            [manifestFile],
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
          if (
            dryRunMergeResults &&
            dryRunMergeResults.conflicts &&
            dryRunMergeResults.conflicts.length &&
            !isUpdating
          ) {
            // we need to prompt the user to confirm the changes before proceeding
            res.json({
              success: false,
              components: dryRunMergeResults.components.filter((c) => c.includesSchema || c.includesExports),
            });
          } else {
            const realMerge = new SchemaMerger(
              [manifestFile],
              path.join(currentProject.dataDir, 'schemas/sdk'),
              path.join(currentProject.dataDir, 'dialogs/imported'),
              false, // copy only? true = dry run
              false, // verbosity: true = verbose
              composer.log,
              composer.log,
              composer.log
            );

            const mergeResults = await realMerge.merge();
            const installedComponents = mergeResults.components.filter((c) => c.includesSchema || c.includesExports);
            if (mergeResults) {
              res.json({
                success: true,
                components: installedComponents,
              });

              let runtimeLanguage = 'c#';
              if (currentProject.settings.runtime.key === 'node-azurewebapp') {
                runtimeLanguage = 'js';
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
            await runtime.uninstallComponent(currentProject.settings.runtime.path, packageName);
          } catch (err) {
            composer.log('Error uninstalling', err);
          }
          // if packageName is in the github form <username/package> remove the first part, because otherwise the unisntall doesn't work
          if (packageName.match(/.*\/.*/)) {
            const [user, realPackageName] = packageName.split(/\//);
            if (!user.match(/^@/)) {
              await runtime.uninstallComponent(currentProject.settings.runtime.path, realPackageName);
            }
          }
          res.status(500).json({ success: false, message: err.message });
        }
      } else if (!currentProject.settings?.runtime?.path) {
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

      // get URL or package name
      const packageName = req.body.package;
      if (packageName && currentProject.settings?.runtime?.path) {
        try {
          const output = await runtime.uninstallComponent(currentProject.settings.runtime.path, packageName);

          const manifestFile = runtime.identifyManifest(currentProject.settings?.runtime?.path);

          // call do a dry run on the dialog merge
          const merger = new SchemaMerger(
            [manifestFile],
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
            components: mergeResults.components.filter((c) => c.includesSchema || c.includesExports),
          });
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
};
