// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable security/detect-non-literal-fs-filename */
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

import rimraf from 'rimraf';
import * as fs from 'fs-extra';

import { copyDir } from './copyDir';
import { IFileStorage } from './interface';

const execAsync = promisify(exec);
const removeDirAndFiles = promisify(rimraf);

export default async (composer: any): Promise<void> => {
  /**
   * these are the new 2.0 adaptive runtime definitions
   */
  composer.addRuntimeTemplate({
    key: 'adaptive-runtime-dotnet-webapp',
    name: 'C# - Web App',
    build: async (runtimePath: string, _project: any) => {
      composer.log(`BUILD THIS C# PROJECT! at ${runtimePath}...`);
      composer.log('Run dotnet user-secrets init...');

      // TODO: capture output of this and store it somewhere useful
      const { stderr: initErr } = await execAsync(`dotnet user-secrets init --project ${_project.name}.csproj`, {
        cwd: runtimePath,
      });
      if (initErr) {
        throw new Error(initErr);
      }

      composer.log('Run dotnet build...');
      const { stderr: buildErr } = await execAsync(`dotnet build ${_project.name}.csproj`, { cwd: runtimePath });
      if (buildErr) {
        throw new Error(buildErr);
      }
      composer.log('FINISHED BUILDING!');
    },
    installComponent: async (
      runtimePath: string,
      packageName: string,
      version: string,
      source: string,
      _project: any,
      isPreview = false
    ): Promise<string> => {
      // run dotnet install on the project
      const command = `dotnet add ${_project.name}.csproj package "${packageName}"${
        version ? ' --version="' + version + '"' : ''
      }${source ? ' --source="' + source + '"' : ''}${isPreview ? ' --prerelease' : ''}`;
      composer.log('EXEC:', command);
      const { stderr: installError, stdout: installOutput } = await execAsync(command, {
        cwd: path.join(runtimePath),
      });
      if (installError) {
        throw new Error(installError);
      }
      return installOutput;
    },
    uninstallComponent: async (runtimePath: string, packageName: string, _project: any): Promise<string> => {
      // run dotnet install on the project
      composer.log(`EXECUTE: dotnet remove ${_project.name}.csproj package ${packageName}`);
      const { stderr: installError, stdout: installOutput } = await execAsync(
        `dotnet remove  ${_project.name}.csproj package ${packageName}`,
        {
          cwd: path.join(runtimePath),
        }
      );
      if (installError) {
        throw new Error(installError);
      }
      return installOutput;
    },
    identifyManifest: (runtimePath: string, projName?: string): string => {
      return path.join(runtimePath, `${projName}.csproj`);
    },
    run: async (project: any, localDisk: IFileStorage) => {
      composer.log('RUN THIS C# PROJECT!');
    },
    buildDeploy: async (runtimePath: string, project: any, settings: any, profileName: string): Promise<string> => {
      composer.log('BUILD FOR DEPLOY TO AZURE!');

      // find publishing profile in list
      const profile = project.settings.publishTargets.find((p) => p.name === profileName);

      const csproj = `${project.name}.csproj`;
      const publishFolder = path.join(runtimePath, 'bin', 'release', 'publishTarget');
      const deployFilePath = path.join(runtimePath, '.deployment');
      const dotnetProjectPath = path.join(runtimePath, csproj);

      // Check for existing .deployment file, if missing, write it.
      if (!(await fs.pathExists(deployFilePath))) {
        const data = `[config]\nproject = ${csproj}`;

        await fs.writeFile(deployFilePath, data);
      }

      // do the dotnet publish
      try {
        const configuration = JSON.parse(profile.configuration);
        const runtimeIdentifier = configuration.runtimeIdentifier;

        // if runtime identifier set, make dotnet runtime to self contained, default runtime identifier is win-x64, please refer to https://docs.microsoft.com/en-us/dotnet/core/rid-catalog
        const buildCommand = `dotnet publish "${dotnetProjectPath}" -c release -o "${publishFolder}" -v q --self-contained true -r ${
          runtimeIdentifier ?? 'win-x64'
        }`;
        //  }
        const { stdout, stderr } = await execAsync(buildCommand, {
          cwd: runtimePath,
        });
        composer.log('OUTPUT FROM BUILD', stdout);
        if (stderr) {
          composer.log('ERR FROM BUILD: ', stderr);
        }
      } catch (err) {
        composer.log('Error doing dotnet publish', err);
        throw err;
        return;
      }

      // return the location of the build artifiacts
      return publishFolder;
    },
    setSkillManifest: async (
      dstRuntimePath: string,
      dstStorage: IFileStorage,
      srcManifestDir: string,
      srcStorage: IFileStorage,
      mode = 'azurewebapp' // set default as azurewebapp
    ) => {
      // update manifst into runtime wwwroot
      if (mode === 'azurewebapp') {
        const manifestDstDir = path.resolve(dstRuntimePath, 'wwwroot', 'manifests');

        if (await fs.pathExists(manifestDstDir)) {
          await removeDirAndFiles(manifestDstDir);
        }

        if (await fs.pathExists(srcManifestDir)) {
          await copyDir(srcManifestDir, srcStorage, manifestDstDir, dstStorage);
        }
      }
    },
  });

  composer.addRuntimeTemplate({
    key: 'adaptive-runtime-dotnet-functions',
    name: 'C# - Functions',
    // startCommand: 'dotnet run',
    // path: dotnetTemplatePath,
    build: async (runtimePath: string, _project: any) => {
      composer.log(`BUILD THIS C# PROJECT! at ${runtimePath}...`);
      composer.log('Run dotnet user-secrets init...');

      // TODO: capture output of this and store it somewhere useful
      const { stderr: initErr } = await execAsync(`dotnet user-secrets init --project ${_project.name}.csproj`, {
        cwd: runtimePath,
      });
      if (initErr) {
        throw new Error(initErr);
      }

      composer.log('Run dotnet build...');
      const { stderr: buildErr } = await execAsync(`dotnet build ${_project.name}.csproj`, { cwd: runtimePath });
      if (buildErr) {
        throw new Error(buildErr);
      }
      composer.log('FINISHED BUILDING!');
    },
    installComponent: async (
      runtimePath: string,
      packageName: string,
      version: string,
      source: string,
      _project: any,
      isPreview = false
    ): Promise<string> => {
      // run dotnet install on the project
      const command = `dotnet add ${_project.name}.csproj package "${packageName}"${
        version ? ' --version="' + version + '"' : ''
      }${source ? ' --source="' + source + '"' : ''}${isPreview ? ' --prerelease' : ''}`;
      composer.log('EXEC:', command);
      const { stderr: installError, stdout: installOutput } = await execAsync(command, {
        cwd: path.join(runtimePath),
      });
      if (installError) {
        throw new Error(installError);
      }
      return installOutput;
    },
    uninstallComponent: async (runtimePath: string, packageName: string, _project: any): Promise<string> => {
      // run dotnet install on the project
      composer.log(`EXECUTE: dotnet remove ${_project.name}.csproj package ${packageName}`);
      const { stderr: installError, stdout: installOutput } = await execAsync(
        `dotnet remove  ${_project.name}.csproj package ${packageName}`,
        {
          cwd: path.join(runtimePath),
        }
      );
      if (installError) {
        throw new Error(installError);
      }
      return installOutput;
    },
    identifyManifest: (runtimePath: string, projName?: string): string => {
      return path.join(runtimePath, `${projName}.csproj`);
    },
    run: async (project: any, localDisk: IFileStorage) => {
      composer.log('RUN THIS C# PROJECT!');
    },
    buildDeploy: async (runtimePath: string, project: any, settings: any, profileName: string): Promise<string> => {
      composer.log('BUILD FOR DEPLOY TO AZURE!');

      // find publishing profile in list
      const profile = project.settings.publishTargets.find((p) => p.name === profileName);
      const csproj = `${project.name}.csproj`;
      const publishFolder = path.join(runtimePath, 'bin', 'release', 'publishTarget');
      const deployFilePath = path.join(runtimePath, '.deployment');
      const dotnetProjectPath = path.join(runtimePath, csproj);

      // Check for existing .deployment file, if missing, write it.
      if (!(await fs.pathExists(deployFilePath))) {
        const data = `[config]\nproject = ${csproj}`;

        await fs.writeFile(deployFilePath, data);
      }

      // do the dotnet publish
      try {
        const buildCommand = `dotnet publish "${dotnetProjectPath}" -c release -o "${publishFolder}" -v q`;
        const { stdout, stderr } = await execAsync(buildCommand, {
          cwd: runtimePath,
        });
        composer.log('OUTPUT FROM BUILD', stdout);
        if (stderr) {
          composer.log('ERR FROM BUILD: ', stderr);
        }
      } catch (err) {
        composer.log('Error doing dotnet publish', err);
        throw err;
        return;
      }
      // return the location of the build artifiacts
      return publishFolder;
    },
  });

  /**
   * This is support for the new javascript runtime
   */
  composer.addRuntimeTemplate({
    key: 'adaptive-runtime-js-webapp',
    name: 'JS - Web App (preview)',
    // startCommand: 'node ./lib/webapp.js',
    // path: nodeTemplatePath,
    build: async (runtimePath: string, _project: any) => {
      // do stuff
      composer.log('BUILD THIS JS PROJECT');
      // install dev dependencies in production, make sure typescript is installed
      const { stderr: installErr } = await execAsync('npm install && npm install --only=dev', {
        cwd: runtimePath,
        timeout: 120000,
      });
      if (installErr) {
        // in order to not throw warning, we just log all warning and error message
        composer.log(`npm install timeout, ${installErr}`);
      }

      composer.log('BUILD COMPLETE');
    },
    installComponent: async (
      runtimePath: string,
      packageName: string,
      version: string,
      source: string,
      _project: any,
      isPreview = false
    ): Promise<string> => {
      // run dotnet install on the project
      const { stderr: installError, stdout: installOutput } = await execAsync(
        `npm install --loglevel=error --save ${packageName}${version ? '@' + version : ''}`,
        {
          cwd: path.join(runtimePath),
        }
      );
      if (installError) {
        throw new Error(installError);
      }
      return installOutput;
    },
    uninstallComponent: async (runtimePath: string, packageName: string): Promise<string> => {
      // run dotnet install on the project
      const { stderr: installError, stdout: installOutput } = await execAsync(
        `npm uninstall --loglevel=error --save ${packageName}`,
        {
          cwd: path.join(runtimePath),
        }
      );
      if (installError) {
        throw new Error(installError);
      }
      return installOutput;
    },
    identifyManifest: (runtimePath: string, projName?: string): string => {
      return path.join(runtimePath, 'package.json');
    },
    buildDeploy: async (runtimePath: string, project: any, settings: any, profileName: string): Promise<string> => {
      // do stuff
      composer.log(`BUILD THIS JS PROJECT in ${runtimePath}`);
      const { stderr: installErr } = await execAsync('npm install', {
        cwd: path.resolve(runtimePath, '.'),
      });
      if (installErr) {
        composer.log(installErr);
      }
      composer.log('BUILD COMPLETE');
      return path.resolve(runtimePath, '.');
    },
  });

  composer.addRuntimeTemplate({
    key: 'adaptive-runtime-js-functions',
    name: 'JS - Functions (preview)',
    build: async (runtimePath: string, _project: any) => {
      // do stuff
      composer.log('BUILD THIS JS PROJECT');
      // install dev dependencies in production, make sure typescript is installed
      const { stderr: installErr } = await execAsync('npm install && npm install --only=dev', {
        cwd: runtimePath,
        timeout: 120000,
      });
      if (installErr) {
        // in order to not throw warning, we just log all warning and error message
        composer.log(`npm install timeout, ${installErr}`);
      }

      composer.log('BUILD COMPLETE');
    },
    installComponent: async (
      runtimePath: string,
      packageName: string,
      version: string,
      source: string,
      _project: any,
      isPreview = false
    ): Promise<string> => {
      // run dotnet install on the project
      const { stderr: installError, stdout: installOutput } = await execAsync(
        `npm install --loglevel=error --save ${packageName}${version ? '@' + version : ''}`,
        {
          cwd: path.join(runtimePath),
        }
      );
      if (installError) {
        throw new Error(installError);
      }
      return installOutput;
    },
    uninstallComponent: async (runtimePath: string, packageName: string): Promise<string> => {
      // run dotnet install on the project
      const { stderr: installError, stdout: installOutput } = await execAsync(
        `npm uninstall --loglevel=error --save ${packageName}`,
        {
          cwd: path.join(runtimePath),
        }
      );
      if (installError) {
        throw new Error(installError);
      }
      return installOutput;
    },
    identifyManifest: (runtimePath: string, projName?: string): string => {
      return path.join(runtimePath, 'package.json');
    },
    buildDeploy: async (runtimePath: string, project: any, settings: any, profileName: string): Promise<string> => {
      // do stuff
      composer.log(`BUILD THIS JS PROJECT in ${runtimePath}`);
      const { stderr: installErr } = await execAsync('npm ci', {
        cwd: path.resolve(runtimePath, '.'),
      });
      if (installErr) {
        composer.log(installErr);
      }
      composer.log('BUILD COMPLETE');
      return path.resolve(runtimePath, '.');
    },
  });
};
