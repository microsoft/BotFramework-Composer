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

export const ImportController = {
  import: async (req, res) => {
    const user = await PluginLoader.getUserFromRequest(req);
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);
    currentProject;

    // get URL or package name
    const packageName = req.query.package || req.body.package;
    const version = req.query.version || req.body.version;

    if (packageName) {
      try {
        const files = await importRemoteAsset(currentProject, packageName, version);
        return res.json(files);
      } catch (err) {
        return res.status(500).json(err);
      }
    } else {
      res.status(500).json({ message: 'Please specify a package name or git url to import' });
    }
  },
};

const importRemoteAsset = async (currentProject, packageName, version) => {
  const files = await fetchAndExtract(packageName, version);

  if (files.length) {
    // copy declarative files into this project's imported dialogs folder
    if (!currentProject.fileStorage.exists(path.join(currentProject.dataDir, 'importedDialogs', packageName))) {
      await currentProject.fileStorage.mkDir(path.join(currentProject.dataDir, 'importedDialogs', packageName), {
        recursive: true,
      });
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
      // * rename dialogs into namespace?
      // * update references to renamed dialogs, lu and LG files
      // * if schema included, rebuild schema
      // * add an import statement for new common.lg into main common.lg?
      // ^^ for an LG library, this would be helpful - but not necessary for all LG files

      await currentProject.fileStorage.writeFile(
        path.join(currentProject.dataDir, 'importedDialogs', packageName, file.filename),
        file.content
      );
    }
  }

  return files;
};

const fetchAndExtract = async (
  uri,
  version
): Promise<{ filename: string; fullpath: string; path: string; content: string }[]> => {
  // process package as an npm module.

  const filterFiles = async () => {
    const patterns: string[] = [
      '**/*.dialog',
      '**/*.lg',
      '**/*.lu',
      'manifests/*.json',
      '!(generated/**)',
      '!(runtime/**)',
    ];
    const ldfs = new LocalDiskStorage();
    const files = await ldfs.glob(patterns, path.join(TMP_DIR, uri));

    return files.map((f) => {
      return {
        filename: f,
        fullpath: path.join(TMP_DIR, uri, f),
        path: path.dirname(path.join(f)),
        content: fs.readFileSync(path.join(TMP_DIR, uri, f), 'utf8'),
      };
    });
  };

  return new Promise(async (resolve, reject) => {
    let type = 'npm';

    // github packages are in the form of user/repo and potentially #version
    if (uri.match(/\//)) {
      type = 'github';
    }

    if (!version) {
      switch (type) {
        case 'npm':
          version = 'latest';
          break;
        case 'github':
          version = 'master';
          break;
      }
    }

    let stream;

    switch (type) {
      case 'npm':
        // download and extract the files from Npm
        await downloadNpmPackage({
          arg: `${uri}@${version}`,
          dir: TMP_DIR,
        });
        resolve(await filterFiles());
        break;
      case 'github':
        stream = await axios({
          method: 'get',
          url: `https://github.com/${uri}/archive/${version}.zip`,
          responseType: 'stream',
        });
        stream.data.pipe(
          unzipper.Extract({ path: path.join(TMP_DIR, uri) }).on('close', async () => {
            console.log('EXTRACTED GITHUB ZIP FILE!!');
            resolve(await filterFiles());
          })
        );
        break;
    }
  });
};
