// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import { ExtensionContext } from '@bfc/extension';
import { SchemaMerger } from '@microsoft/bf-dialog/lib/library/schemaMerger';

// import downloadNpmPackage from 'download-npm-package';

import { BotProjectService } from '../services/project';

// this flag controls whether or not composer will remove imported assets when a package is removed
const CLEANUP_FILES_ON_UNINSTALL = true;

export interface FileRef {
  filename: string;
  fullpath: string;
  path: string;
  content: string;
}

export const LibraryController = {
  getLibrary: async function (req, res) {
    // get libraries installed "locally"
    // const localLibrary = Store.get('library', []);
    // const combined = ExtensionContext.extensions.libraries;
    // mix in any libraries installed via plugins
    // TODO: externalize this into a plugin config file
    const combined = [
      {
        name: 'benbrown/dialogs-getemail',
        version: '',
        category: 'Input Helpers',
        description: 'collect and validate an email address',
      },
      {
        name: 'benbrown/dialogs-getphone',
        version: '',
        category: 'Input Helpers',
        description: 'collect and validate a phone number',
      },
      {
        name: 'benbrown/dialogs-multiline',
        version: '',
        category: 'Input Helpers',
        description: 'collect multiple messages into a single field with a [DONE] button',
      },
    ];

    res.json(combined);
  },
  getComponents: async function (req, res) {
    const user = await ExtensionContext.getUserFromRequest(req);
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);
    const runtime = ExtensionContext.getRuntimeByProject(currentProject);

    if (currentProject.settings?.runtime?.path) {
      const manifestFile = runtime.identifyManifest(currentProject.settings?.runtime?.path);

      const dryrun = new SchemaMerger(
        [manifestFile],
        '',
        path.join(currentProject.dataDir, 'dialogs/imported'),
        true, // copy only? true = dry run
        false, // verbosity: true = verbose
        console.log,
        console.warn,
        console.error
      );
      const dryRunMergeResults = await dryrun.merge();

      if (dryRunMergeResults) {
        res.json({
          components: dryRunMergeResults.components.filter((c) => c.includesSchema || c.includesExports),
        });
      } else {
        res.status(500).json({
          message: 'Could not load component list',
        });
      }
    } else {
      res.json({
        components: [],
      });
    }
  },
  import: async function (req, res) {
    const user = await ExtensionContext.getUserFromRequest(req);
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);
    const runtime = ExtensionContext.getRuntimeByProject(currentProject);

    // get URL or package name
    const packageName = req.query.package || req.body.package;
    const version = req.query.version || req.body.version;
    const isUpdating = req.query.isUpdating || req.body.isUpdating || false;

    if (packageName && currentProject.settings?.runtime?.path) {
      try {
        // Call the runtime's component install mechanism.
        const installOutput = await runtime.installComponent(
          currentProject.settings?.runtime?.path || '',
          packageName,
          version
        );

        const manifestFile = runtime.identifyManifest(currentProject.settings?.runtime?.path);

        console.log('INSTALL OUTPUT', installOutput);

        console.log('EXAMINING PACKAGE: ', manifestFile);
        // call do a dry run on the dialog merge
        const dryrun = new SchemaMerger(
          [manifestFile],
          '',
          path.join(currentProject.dataDir, 'dialogs'),
          true, // copy only? true = dry run
          true, // verbosity: true = verbose
          console.log,
          console.warn,
          console.error
        );

        const dryRunMergeResults = await dryrun.merge();
        console.log('MERGE RESULTS', dryRunMergeResults);

        // evaluate dry run.
        // Did we have any conflicts that prevent moving forward? if so, install
        // Otherwise, copy the files into the project

        // check the results to see if we have any problems
        if (dryRunMergeResults && dryRunMergeResults.conflicts && dryRunMergeResults.conflicts.length && !isUpdating) {
          // we need to prompt the user to confirm the changes before proceeding
          res.json({
            success: false,
            results: dryRunMergeResults,
          });
        } else {
          const realMerge = new SchemaMerger(
            [manifestFile],
            '',
            path.join(currentProject.dataDir, 'dialogs/imported'),
            false, // copy only? true = dry run
            false, // verbosity: true = verbose
            console.log,
            console.warn,
            console.error
          );

          const mergeResults = await realMerge.merge();
          if (mergeResults) {
            console.log('MERGE RESULTS', mergeResults);
            res.json({
              success: true,
              name: packageName,
              installedVersion: version,
              results: mergeResults,
            });
          } else {
            res.json({
              success: false,
              results: 'Could not merge components',
            });
          }
        }
      } catch (err) {
        console.error('Error in import', { message: err.message });
        await runtime.uninstallComponent(currentProject.settings.runtime.path, packageName);
        res.status(500).json({ success: false, message: err.message });
      }
    } else if (!currentProject.settings?.runtime?.path) {
      res.status(500).json({ message: 'Please eject your runtime before installing a package.' });
    } else {
      res.status(500).json({ message: 'Please specify a package name or git url to import.' });
    }
  },
  removeImported: async function (req, res) {
    const user = await ExtensionContext.getUserFromRequest(req);
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);
    const runtime = ExtensionContext.getRuntimeByProject(currentProject);

    // get URL or package name
    const packageName = req.query.package || req.body.package;
    if (packageName && currentProject.settings?.runtime?.path) {
      try {
        const output = await runtime.uninstallComponent(currentProject.settings.runtime.path, packageName);

        const manifestFile = runtime.identifyManifest(currentProject.settings?.runtime?.path);

        console.log('UNINSTALL OUTPUT', output);
        console.log('EXAMINING PACKAGE: ', manifestFile);
        // call do a dry run on the dialog merge
        const dryrun = new SchemaMerger(
          [manifestFile],
          '',
          path.join(currentProject.dataDir, 'dialogs/imported'),
          true, // copy only? true = dry run
          true, // verbosity: true = verbose
          console.log,
          console.warn,
          console.error
        );

        const dryRunMergeResults = await dryrun.merge();

        if (CLEANUP_FILES_ON_UNINSTALL) {
          // Remove the files from the project
          const projectFiles = path.join(currentProject.dataDir, 'dialogs/imported', packageName);
          await currentProject.fileStorage.rmrfDir(projectFiles);
        }

        console.log('MERGE RESULTS', dryRunMergeResults);
        res.json({
          success: true,
          // results: mergeResults,
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
