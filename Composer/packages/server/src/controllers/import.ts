// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';
import fs from 'fs';

import * as unzipper from 'unzip-stream';
import axios from 'axios';
import { PluginLoader } from '@bfc/plugin-loader';
import downloadNpmPackage from 'download-npm-package';

import { BotProjectService } from '../services/project';
import { LocalDiskStorage } from '../models/storage/localDiskStorage';

const TMP_DIR = '/tmp';

export interface FileRef {
  filename: string;
  fullpath: string;
  path: string;
  content: string;
}

export const ImportController = {
  import: async function (req, res) {
    const user = await PluginLoader.getUserFromRequest(req);
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);

    // get URL or package name
    const packageName = req.query.package || req.body.package;
    const version = req.query.version || req.body.version;

    if (packageName) {
      try {
        const importResults = await ImportController.importRemoteAsset(currentProject, packageName, version);
        res.json(importResults);
      } catch (err) {
        console.error('Error in import', { message: err.message });
        res.status(500).json({ message: err.message });
      }
    } else {
      res.status(500).json({ message: 'Please specify a package name or git url to import' });
    }
  },
  importRemoteAsset: async function (
    currentProject,
    packageName,
    version
  ): Promise<{ installedVersion: string; files: Partial<FileRef>[] }> {
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

      // TODO: FIRST! Make sure that no files overlap! Can't have any name collisions!
      for (let f = 0; f < files.length; f++) {
        const basename = path.basename(files[f].filename);
        if (currentProject.files.find((f) => basename === path.basename(f.path))) {
          throw new Error(`A declarative asset with the name ${basename} already exists in this project`);
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
      }
    }

    const results = {
      files: files.map((f) => {
        return { filename: f.filename, path: f.path };
      }),
      name: packageName,
      installedVersion,
    };

    return results;
  },
  fetchAndExtract: async function (uri, version): Promise<{ installedVersion: string; files: FileRef[] }> {
    // process package as an npm module.

    const filterFiles = async () => {
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
        type = 'github';
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
            return reject(err);
          }
          // get version from package file
          resolve(await filterFiles());
          break;
        case 'github':
          console.log(`Fetching from Github`);
          stream = await axios({
            method: 'get',
            url: `https://github.com/${uri}/archive/${version}.zip`,
            responseType: 'stream',
          });
          stream.data.pipe(
            unzipper.Extract({ path: path.join(TMP_DIR, uri) }).on('close', async () => {
              resolve(await filterFiles());
            })
          );
          break;
        case 'nuget':
          console.log(`Fetching from Nuget`);
          stream = await axios({
            method: 'get',
            url: `https://www.nuget.org/api/v2/package/${uri}${version ? `/${version}` : ''}`,
            responseType: 'stream',
          });
          stream.data.pipe(
            unzipper.Extract({ path: path.join(TMP_DIR, uri) }).on('close', async () => {
              // possible to get version from some package file?
              resolve(await filterFiles());
            })
          );
          break;
      }
    });
  },
};
