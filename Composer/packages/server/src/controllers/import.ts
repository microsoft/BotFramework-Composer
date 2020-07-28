// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';
import fs from 'fs';

import * as unzipper from 'unzip-stream';
import axios from 'axios';
import { PluginLoader, pluginLoader } from '@bfc/plugin-loader';
import downloadNpmPackage from 'download-npm-package';

import { BotProjectService } from '../services/project';
import { LocalDiskStorage } from '../models/storage/localDiskStorage';
import { Store } from '../store/store';

const TMP_DIR = '/tmp';

export interface FileRef {
  filename: string;
  fullpath: string;
  path: string;
  content: string;
}

export const ImportController = {
  getLibrary: async function (req, res) {
    // get libraries installed "locally"
    const localLibrary = Store.get('library', []);
    const combined = localLibrary.concat(pluginLoader.extensions.libraries);
    // mix in any libraries installed via plugins
    res.json(combined);
  },
  import: async function (req, res) {
    const user = await PluginLoader.getUserFromRequest(req);
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);

    // get URL or package name
    const packageName = req.query.package || req.body.package;
    const version = req.query.version || req.body.version;
    const isUpdating = req.query.isUpdating || req.body.isUpdating || false;

    if (packageName) {
      try {
        const importResults = await ImportController.importRemoteAsset(
          currentProject,
          packageName,
          version,
          isUpdating
        );
        if (importResults) {
          res.json(importResults);
        } else {
          res.status(500).json({ message: 'No declarative assets were found in the specified package.' });
        }
      } catch (err) {
        console.error('Error in import', { message: err.message });
        res.status(500).json({ message: err.message });
      }
    } else {
      res.status(500).json({ message: 'Please specify a package name or git url to import' });
    }
  },
  removeImported: async function (req, res) {
    const user = await PluginLoader.getUserFromRequest(req);
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);

    // get URL or package name
    const packageName = req.query.package || req.body.package;

    if (packageName) {
      // find this package in the bot's settings
      const thisPackage = currentProject?.settings?.importedLibraries?.find((p) => p.name === packageName);
      if (thisPackage) {
        // remove the files located at package.location
        try {
          await currentProject.fileStorage.rmrfDir(path.join(currentProject.dataDir, thisPackage.location));
        } catch (err) {
          return res.status(500).json({ message: err.message });
        }
        return res.json({ package: packageName, removed: true });
      } else {
        res.status(500).json({ message: `No installed library matches the name ${packageName}` });
      }
    } else {
      res.status(500).json({ message: 'Please specify a package name to remove' });
    }
  },
  importRemoteAsset: async function (
    currentProject,
    packageName,
    version,
    isUpdating
  ): Promise<{ installedVersion: string; files: Partial<FileRef>[] } | undefined> {
    console.log('Fetching package', packageName);
    const { files, installedVersion } = await ImportController.fetchAndExtract(packageName, version);
    console.log(`Got ${files.length} files`);
    if (files.length) {
      // copy declarative files into this project's imported dialogs folder
      if (!currentProject.fileStorage.exists(path.join(currentProject.dataDir, 'importedDialogs', packageName))) {
        await currentProject.fileStorage.mkDir(path.join(currentProject.dataDir, 'importedDialogs', packageName), {
          recursive: true,
        });
      }

      // FIRST! Make sure that no files overlap! Can't have any name collisions!
      for (let f = 0; f < files.length; f++) {
        const basename = path.basename(files[f].filename);
        const importedDirname = path.relative(TMP_DIR, files[f].fullpath);
        let found;
        currentProject.files.forEach((f, name) => {
          if (!found && basename === path.basename(f.path)) {
            found = currentProject.files.get(name) as FileRef;
          }
        });
        if (found) {
          const existingDirname = path.relative(path.join(currentProject.dataDir, 'importedDialogs'), found.path);
          // if we are not updating, do not allow overwrite
          // however if we ARE updating and this is the same file, it is ok to overwrite
          if (!isUpdating || importedDirname !== existingDirname) {
            throw new Error(`A declarative asset with the name ${basename} already exists in this project`);
          }
        }
      }

      for (let f = 0; f < files.length; f++) {
        const file = files[f];
        await currentProject.fileStorage.mkDir(
          path.join(currentProject.dataDir, 'importedDialogs', packageName, file.path),
          {
            recursive: true,
          }
        );

        // FUTURE TASKS:
        // process some files??
        // * rename common.lg to something else
        // * rename dialogs into namespace? use the root dialog as basename?
        // * update references to renamed dialogs, lu and LG files
        // * if schema included, rebuild schema
        // * add an import statement for new common.lg into main common.lg?
        // ^^ for an LG library, this would be helpful - but not necessary for all LG files

        // write all the files into a subfolder of importedDialogs/
        await currentProject.fileStorage.writeFile(
          path.join(currentProject.dataDir, 'importedDialogs', packageName, file.filename),
          file.content
        );

        // TODO: if found a new LG file that is not bound to a specific dialog, write it as an import into the common.lg file so they are available.
      }

      const results = {
        files: files.map((f) => {
          return { filename: f.filename, path: f.path };
        }),
        name: packageName,
        location: path.join('importedDialogs', packageName),
        installedVersion,
      };

      return results;
    } else {
      return;
    }
  },
  fetchAndExtract: async function (uri, version): Promise<{ installedVersion: string; files: FileRef[] }> {
    // process package as an npm module.

    const filterFiles = async (type) => {
      const patterns: string[] = [
        '**/*.dialog',
        '**/*.lg',
        '**/*.lu',
        'manifests/*.json',
        '!(**/generated/**)',
        '!(**/runtime/**)',
      ];
      const ldfs = new LocalDiskStorage();
      const files = await ldfs.glob(patterns, path.join(TMP_DIR, uri));

      const results = files.map((f) => {
        return {
          filename: f,
          fullpath: path.join(TMP_DIR, uri, f),
          path: path.dirname(path.join(f)),
          content: fs.readFileSync(path.join(TMP_DIR, uri, f), 'utf8'),
        };
      });

      // determine the package version if possible
      switch (type) {
        case 'npm':
          // read package.json file
          try {
            const pkg = fs.readFileSync(path.join(TMP_DIR, uri, 'package.json'), 'utf8');
            const json = JSON.parse(pkg);
            version = json.version;
          } catch (err) {
            console.error('No package.json file found in imported library');
          }
          break;
      }

      // clean up temporary files.
      ldfs.rmrfDir(path.join(TMP_DIR, uri));

      return {
        files: results,
        installedVersion: version,
      };
    };

    return new Promise(async (resolve, reject) => {
      let type = 'npm';

      // github packages are in the form of user/repo and potentially #version
      if (uri.match(/\//)) {
        // npm packages can be in the form @foo/bar
        if (!uri.match(/^@/)) {
          type = 'github';
        }
      }
      if (uri.match(/\./)) {
        type = 'nuget';
      }

      if (!version) {
        switch (type) {
          case 'npm':
            version = 'latest';
            break;
          case 'github':
            version = 'master';
            break;
          case 'nuget':
            version = null;
            break;
        }
      }

      let stream;

      switch (type) {
        case 'npm':
          console.log(`Fetching with NPM`);
          // download and extract the files from Npm
          try {
            await downloadNpmPackage({
              arg: `${uri}@${version}`,
              dir: TMP_DIR,
            });
          } catch (err) {
            console.error('NPM fetch failed', err);
            if (err.message === 'Response code 404 (Not Found)') {
              reject(new Error('The package or version you requested could be not found on npm.'));
            } else {
              reject(err);
            }
          }
          // get version from package file
          resolve(await filterFiles(type));
          break;
        case 'github':
          console.log(`Fetching from Github`);
          try {
            stream = await axios({
              method: 'get',
              url: `https://github.com/${uri}/archive/${version}.zip`,
              responseType: 'stream',
            });
            stream.data.pipe(
              unzipper.Extract({ path: path.join(TMP_DIR, uri) }).on('close', async () => {
                resolve(await filterFiles(type));
              })
            );
          } catch (err) {
            console.error('Github fetch failed', err);
            if (err.message === 'Request failed with status code 404') {
              reject(new Error('The package or version you requested could not be found on Github'));
            } else {
              reject(err);
            }
          }
          break;
        case 'nuget':
          console.log(`Fetching from Nuget`);
          try {
            stream = await axios({
              method: 'get',
              url: `https://www.nuget.org/api/v2/package/${uri}${version ? `/${version}` : ''}`,
              responseType: 'stream',
            });
            stream.data.pipe(
              unzipper.Extract({ path: path.join(TMP_DIR, uri) }).on('close', async () => {
                // possible to get version from some package file?
                resolve(await filterFiles(type));
              })
            );
          } catch (err) {
            console.error('Nuget fetch failed', err);
            if (err.message === 'Request failed with status code 404') {
              reject(new Error('The package or version you requested could not be found on nuget'));
            } else {
              reject(err);
            }
          }
          break;
      }
    });
  },
};
