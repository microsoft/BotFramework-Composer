// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from 'path';

import * as fs from 'fs-extra';
import { IBotProject } from '@botframework-composer/types';

import { OnPublishProgress } from './types';

// ---------------------------------------- File copying helpers ----------------------------------------//

interface Stat {
  isDir: boolean;
  isFile: boolean;
  lastModified: string;
  size: string;
}

interface MakeDirectoryOptions {
  recursive?: boolean;
}

interface IFileStorage {
  stat(path: string): Promise<Stat>;
  readFile(path: string): Promise<string>;
  readDir(path: string): Promise<string[]>;
  exists(path: string): Promise<boolean>;
  writeFile(path: string, content: any): Promise<void>;
  removeFile(path: string): Promise<void>;
  mkDir(path: string, options?: MakeDirectoryOptions): Promise<void>;
  rmDir(path: string): Promise<void>;
  glob(pattern: string, path: string): Promise<string[]>;
  copyFile(src: string, dest: string): Promise<void>;
  rename(oldPath: string, newPath: string): Promise<void>;
}

const copyDir = async (
  srcDir: string,
  srcStorage: IFileStorage,
  dstDir: string,
  dstStorage: IFileStorage,
  pathsToExclude?: Set<string>
) => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!(await srcStorage.exists(srcDir)) || !(await srcStorage.stat(srcDir)).isDir) {
    throw new Error(`No such dir ${srcDir}}`);
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!(await dstStorage.exists(dstDir))) {
    await dstStorage.mkDir(dstDir, { recursive: true });
  }

  const itemPaths = await srcStorage.readDir(srcDir);

  for (const itemPath of itemPaths) {
    const srcPath = path.join(srcDir, itemPath);
    if (pathsToExclude?.has(srcPath)) {
      continue;
    }
    const dstPath = path.join(dstDir, itemPath);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if ((await srcStorage.stat(srcPath)).isFile) {
      // copy files
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const content = await srcStorage.readFile(srcPath);
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await dstStorage.writeFile(dstPath, content);
    } else {
      // recursively copy dirs
      await copyDir(srcPath, srcStorage, dstPath, dstStorage, pathsToExclude);
    }
  }
};

// ---------------------------------------- Manifest helpers ----------------------------------------//

/**
 * update the skill related settings to skills' manifest
 * @param hostname hostname of web app
 * @param msAppId microsoft app id
 * @param skillSettingsPath the path of skills manifest settings
 */
const updateSkillSettings = async (
  profileName: string,
  hostname: string,
  msAppId: string,
  skillSettingsPath: string,
  onProgress: OnPublishProgress
) => {
  /* eslint-disable-next-line security/detect-non-literal-fs-filename -- Safe as no value holds user input */
  const manifestFiles = (await fs.readdir(skillSettingsPath)).filter((x) => x.endsWith('.json'));
  if (manifestFiles.length === 0) {
    onProgress(`The manifest does not exist on path: ${skillSettingsPath}`);
    return;
  }

  for (const manifestFile of manifestFiles) {
    const hostEndpoint = `https://${hostname}.azurewebsites.net/api/messages`;

    const manifest = await fs.readJson(path.join(skillSettingsPath, manifestFile));

    const endpointIndex = manifest.endpoints.findIndex((x) => x.name === profileName);
    if (endpointIndex > -1) {
      // already exists
      return;
    }
    manifest.endpoints.push({
      protocol: 'BotFrameworkV3',
      name: profileName,
      endpointUrl: hostEndpoint,
      description: '<description>',
      msAppId: msAppId,
    });

    await fs.writeJson(path.join(skillSettingsPath, manifestFile), manifest, { spaces: 2 });
  }
};

type StepConfig = {
  appId: string;
  hostname: string;
  pathToArtifacts: string;
  profileName: string;
  project: IBotProject;
};

export const updateSkillManifestsStep = async (config: StepConfig, onProgress: OnPublishProgress): Promise<void> => {
  const { appId, hostname, pathToArtifacts, profileName, project } = config;

  onProgress('Updating skill manifests...');

  // COPY MANIFESTS TO wwwroot/manifests
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (await project.fileStorage.exists(path.join(pathToArtifacts, 'manifests'))) {
    await copyDir(
      path.join(pathToArtifacts, 'manifests'),
      project.fileStorage,
      path.join(pathToArtifacts, 'wwwroot', 'manifests'),
      project.fileStorage
    );
    // Update skill endpoint url in skill manifest.
    await updateSkillSettings(
      profileName,
      hostname,
      appId,
      path.join(pathToArtifacts, 'wwwroot', 'manifests'),
      onProgress
    );
  }
};
