// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from 'path';
import * as fs from 'fs';
import * as semverSort from 'semver-sort';
import axios from 'axios';
import { IExtensionRegistration } from '@botframework-composer/types';
import { SchemaMerger } from '@microsoft/bf-dialog/lib/library/schemaMerger';
import { readdirSync, readFileSync } from 'fs';
import { parseStringPromise } from 'xml2js';

const API_ROOT = '/api';

export default async (composer: IExtensionRegistration): Promise<void> => {
  const normalizeFeed = async (feed) => {
    if (feed.objects) {
      // this is an NPM feed
      return feed.objects.map((i) => {
        return {
          name: i.package.name,
          version: i.package.version,
          authors: i.package?.author?.name,
          keywords: i.package.keywords,
          repository: i.package?.links.repository,
          description: i.package.description,
          language: 'js',
          source: 'npm',
        };
      });
    } else if (feed.data) {
      // this is a nuget feed
      return feed.data.map((i) => {
        return {
          name: i.id,
          version: i.version,
          versions: i.versions ? semverSort.desc(i.versions.map((v) => v.version)) : [i.version],
          authors: i.authors[0],
          keywords: i.tags,
          repository: i.projectUrl,
          description: i.description,
          language: 'c#',
          source: 'nuget',
        };
      });
    } else if (feed.resources) {
      // this is actually a myget feed that points to the feed we want...
      const queryEndpoint = feed.resources.find((resource) => resource['@type'] === 'SearchQueryService');
      if (queryEndpoint) {
        const raw = await axios.get(queryEndpoint['@id']);
        return normalizeFeed(raw.data);
      } else {
        return [];
      }
    } else {
      composer.log('Unknown feed format!', feed);
      return null;
    }
  };

  const getPackageInfo = async (name, url) => {
    // available versions should be folders underneath this folder
    let versions;
    try {
      versions = readdirSync(url, { withFileTypes: true })
        .filter((f) => f.isDirectory())
        .map((f) => f.name);
      if (versions.length === 0) {
        throw new Error('version list is empty');
      }
      versions = semverSort.desc(versions);
    } catch (err) {
      throw new Error(
        `Could not find versions of local package ${name} at ${url}. For more info about setting up a local feed, see here: https://docs.microsoft.com/en-us/nuget/hosting-packages/local-feeds`
      );
    }

    // can read from the nuspec file in the latest to get other info
    let metadata = {};
    try {
      const pathToNuspec = path.join(url, versions[0], `${name}.nuspec`);

      const xml = readFileSync(pathToNuspec, 'utf8');

      const parsed = await parseStringPromise(xml);
      metadata = {
        id: parsed.package.metadata[0].id?.[0],
        version: parsed.package.metadata[0].version?.[0],
        authors: parsed.package.metadata[0].authors,
        projectUrl: parsed.package.metadata[0].projectUrl?.[0],
        description: parsed.package.metadata[0].description?.[0],
        tags: parsed.package.metadata[0].tags?.[0]?.split(/\s/),
        versions: versions.map((v) => {
          return { version: v };
        }),
        source: 'local',
        language: 'c#',
      };
    } catch (err) {
      composer.log(err);
      throw new Error(`Could not parse nuspec for local package ${name} at ${url}`);
    }

    return metadata;
  };

  const crawlLocalFeed = async (url) => {
    // get a list of all the files at the feed URL

    // the local feed is expected to be in folders using the structure defined here:
    // https://docs.microsoft.com/en-us/nuget/hosting-packages/local-feeds
    // the line below will:
    // * get a list of all the files at the specified url
    // * extract only folders from that list
    // * pass each one through the getPackageInfo function, which extracts metadata from the package
    // * return a feed in the form that is used by nuget search API
    const packages = readdirSync(url, { withFileTypes: true }).filter((f) => f.isDirectory());
    const feed = [];
    for (const p of packages) {
      feed.push(await getPackageInfo(p.name, path.join(url, p.name)));
    }
    return feed;
  };

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
      let packageSources = composer.store.read('feeds') as {
        key: string;
        text: string;
        url: string;
        searchUrl?: string;
        readonly?: boolean;
      }[];

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
            url: 'https://azuresearch-usnc.nuget.org/query?q=Tags:%22bf-component%22&prerelease=true',
            searchUrl: 'https://azuresearch-usnc.nuget.org/query?q={{keyword}}+Tags:%22bf-component%22&prerelease=true',
            readonly: true,
            // only ours
            // https://azuresearch-usnc.nuget.org/query?q={search keyword}+preview.bot.component+Tags:%22bf-component%22&prerelease=true
          },
        ];
        composer.store.write('feeds', packageSources);
      }

      res.json(packageSources);
    },
    updateFeeds: async function (req, res) {
      const { key, updatedItem } = req.body;

      let feeds = composer.store.read('feeds') as {
        key: string;
        text: string;
        url: string;
        searchUrl?: string;
      }[];

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
            .json({ message: 'Could not load feed. Please check the feed URL and format.' });
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
      // why an array? In the future it is feasible we would want to mix several feeds together...
      const packageSources = [req.query.url];

      let combined = [];
      for (const url of packageSources) {
        try {
          let raw;
          if (fs.existsSync(url)) {
            const rawlocal = await crawlLocalFeed(url);
            // cast this to the form of the http response from nuget
            raw = { data: { data: rawlocal } };
          } else {
            raw = await axios.get(url);
          }
          const feed = await normalizeFeed(raw.data);
          if (Array.isArray(feed)) {
            combined = combined.concat(feed);
          } else {
            composer.log('Received non-JSON response from ', url);
          }
        } catch (err) {
          composer.log('Could not load library from URL');
          composer.log(err);
          return res
            .status(err.response?.status || 500)
            .json({
              message: `Could not load feed. Please check the feed URL and format. Error message: ${err.message}`,
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

      let runtimePath = currentProject.settings?.runtime?.path;
      if (runtimePath && !path.isAbsolute(runtimePath)) {
        runtimePath = path.resolve(currentProject.dir, runtimePath);
      }

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
            components: dryRunMergeResults.components.filter((c) => c.includesSchema || c.includesExports),
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

      let runtimePath = currentProject.settings?.runtime?.path;
      if (runtimePath && !path.isAbsolute(runtimePath)) {
        runtimePath = path.resolve(currentProject.dir, runtimePath);
      }

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
              components: dryRunMergeResults.components.filter((c) => c.includesSchema || c.includesExports),
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

              // update the settings.plugins array
              const newlyInstalledPlugin = installedComponents.find(c=>c.includesSchema && c.name==packageName);
              if (newlyInstalledPlugin && !currentProject.settings.runtimeSettings?.plugins?.find((p)=>p.name===newlyInstalledPlugin.name)) {
                const newSettings = currentProject.settings;
                if (!newSettings.runtimeSettings) {
                  newSettings.runtimeSettings = {
                    plugins: []
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

      let runtimePath = currentProject.settings?.runtime?.path;
      if (runtimePath && !path.isAbsolute(runtimePath)) {
        runtimePath = path.resolve(currentProject.dir, runtimePath);
      }

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
            components: mergeResults.components.filter((c) => c.includesSchema || c.includesExports),
          });

          // update the settings.plugins array
          if (currentProject.settings.runtimeSettings?.plugins?.find((p)=>p.name===packageName)) {
            const newSettings = currentProject.settings;
            newSettings.runtimeSettings.plugins = newSettings.runtimeSettings.plugins.filter((p)=>p.name!==packageName);
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
