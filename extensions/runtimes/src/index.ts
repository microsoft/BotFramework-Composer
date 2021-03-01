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
  const dotnetTemplatePath = path.resolve(__dirname, '../../../runtime/dotnet');
  const nodeTemplatePath = path.resolve(__dirname, '../../../runtime/node');
  // register the bundled c# runtime used by the local publisher with the eject feature
  composer.addRuntimeTemplate({
    key: 'csharp-azurewebapp',
    name: 'C#',
    startCommand: 'dotnet run --project azurewebapp',
    path: dotnetTemplatePath,
    build: async (runtimePath: string, _project: any) => {
      composer.log(`BUILD THIS C# PROJECT! at ${runtimePath}...`);
      composer.log('Run dotnet user-secrets init...');
      // TODO: capture output of this and store it somewhere useful
      const { stderr: initErr } = await execAsync('dotnet user-secrets init --project azurewebapp', {
        cwd: runtimePath,
      });
      if (initErr) {
        throw new Error(initErr);
      }
      composer.log('Run dotnet build...');
      const { stderr: buildErr } = await execAsync('dotnet build', { cwd: runtimePath });
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
      _project: any
    ): Promise<string> => {
      // run dotnet install on the project
      const command = `dotnet add package "${packageName}"${version ? ' --version="' + version + '"' : ''}${
        source ? ' --source="' + source + '"' : ''
      }`;
      composer.log('EXEC:', command);
      const { stderr: installError, stdout: installOutput } = await execAsync(command, {
        cwd: path.join(runtimePath, 'azurewebapp'),
      });
      if (installError) {
        throw new Error(installError);
      }
      return installOutput;
    },
    uninstallComponent: async (runtimePath: string, packageName: string): Promise<string> => {
      // run dotnet install on the project
      const { stderr: installError, stdout: installOutput } = await execAsync(`dotnet remove package ${packageName}`, {
        cwd: path.join(runtimePath, 'azurewebapp'),
      });
      if (installError) {
        throw new Error(installError);
      }
      return installOutput;
    },
    identifyManifest: (runtimePath: string, projName?: string): string => {
      return path.join(runtimePath, 'azurewebapp', 'Microsoft.BotFramework.Composer.WebApp.csproj');
    },
    run: async (project: any, localDisk: IFileStorage) => {
      composer.log('RUN THIS C# PROJECT!');
    },
    buildDeploy: async (runtimePath: string, project: any, settings: any, profileName: string): Promise<string> => {
      composer.log('BUILD FOR DEPLOY TO AZURE!');

      let csproj = '';
      // find publishing profile in list
      const profile = project.settings.publishTargets.find((p) => p.name === profileName);
      if (profile.type === 'azurePublish') {
        csproj = 'Microsoft.BotFramework.Composer.WebApp.csproj';
      } else if (profile.type === 'azureFunctionsPublish') {
        csproj = 'Microsoft.BotFramework.Composer.Functions.csproj';
      }
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

        // Don't set self-contained and runtimeIdentifier for AzureFunctions.
        let buildCommand = `dotnet publish "${dotnetProjectPath}" -c release -o "${publishFolder}" -v q`;

        if (profile.type === 'azurePublish') {
          // if runtime identifier set, make dotnet runtime to self contained, default runtime identifier is win-x64, please refer to https://docs.microsoft.com/en-us/dotnet/core/rid-catalog
          buildCommand = `dotnet publish "${dotnetProjectPath}" -c release -o "${publishFolder}" -v q --self-contained true -r ${
            runtimeIdentifier ?? 'win-x64'
          }`;
        }
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
      // Then, copy the declarative assets into the build artifacts folder.
      const remoteBotPath = path.join(publishFolder, 'ComposerDialogs');
      const localBotPath = path.join(runtimePath, 'ComposerDialogs');
      await fs.copy(localBotPath, remoteBotPath, {
        overwrite: true,
        recursive: true,
      });

      // write settings to disk in the appropriate location
      const settingsPath = path.join(publishFolder, 'ComposerDialogs', 'settings', 'appsettings.json');
      if (!(await fs.pathExists(path.dirname(settingsPath)))) {
        await fs.mkdirp(path.dirname(settingsPath));
      }
      await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));

      // return the location of the build artifiacts
      return publishFolder;
    },
    eject: async (project, localDisk: IFileStorage, isReplace: boolean) => {
      const sourcePath = dotnetTemplatePath;
      const destPath = path.join(project.dir, 'runtime');
      if ((await project.fileStorage.exists(destPath)) && isReplace) {
        // remove runtime folder
        await removeDirAndFiles(destPath);
      }
      if (!(await project.fileStorage.exists(destPath))) {
        // used to read bot project template from source (bundled in plugin)
        await copyDir(sourcePath, localDisk, destPath, project.fileStorage);
        const schemaDstPath = path.join(project.dir, 'schemas');
        const schemaSrcPath = path.join(sourcePath, 'azurewebapp/Schemas');
        const customSchemaExists = fs.existsSync(schemaDstPath);
        const pathsToExclude: Set<string> = new Set();
        if (customSchemaExists) {
          const sdkExcludePath = await localDisk.glob('sdk.schema', schemaSrcPath);
          if (sdkExcludePath.length > 0) {
            pathsToExclude.add(path.join(schemaSrcPath, sdkExcludePath[0]));
          }
        }
        await copyDir(schemaSrcPath, localDisk, schemaDstPath, project.fileStorage, pathsToExclude);
        const schemaFolderInRuntime = path.join(destPath, 'azurewebapp/Schemas');
        await removeDirAndFiles(schemaFolderInRuntime);
        return path.relative(path.join(project.dir, 'settings'), destPath);
      }
      throw new Error(`Runtime already exists at ${destPath}`);
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
        const manifestDstDir = path.resolve(dstRuntimePath, 'azurewebapp', 'wwwroot', 'manifests');

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
    key: 'node-azurewebapp',
    name: 'JS (preview)',
    startCommand: 'node ./lib/webapp.js',
    path: nodeTemplatePath,
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

      // runtime build need typescript
      const { stderr: install2Err } = await execAsync('npm run build', {
        cwd: runtimePath,
      });
      if (install2Err) {
        throw new Error(install2Err);
      }
      composer.log('BUILD COMPLETE');
    },
    installComponent: async (
      runtimePath: string,
      packageName: string,
      version: string,
      source: string,
      _project: any
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
    run: async (project: any, localDisk: IFileStorage) => {
      // do stuff
    },
    buildDeploy: async (runtimePath: string, project: any, settings: any, profileName: string): Promise<string> => {
      // do stuff
      composer.log('BUILD THIS JS PROJECT');
      const { stderr: installErr } = await execAsync('npm install', {
        cwd: path.resolve(runtimePath, '../'),
      });
      if (installErr) {
        composer.log(installErr);
      }
      const { stderr: install2Err } = await execAsync('npm run build', {
        cwd: path.resolve(runtimePath, '../'),
      });
      if (install2Err) {
        throw new Error(install2Err);
      }
      // write settings to disk in the appropriate location
      const settingsPath = path.join(runtimePath, 'ComposerDialogs', 'settings', 'appsettings.json');
      if (!(await fs.pathExists(path.dirname(settingsPath)))) {
        await fs.mkdirp(path.dirname(settingsPath));
      }
      await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));

      composer.log('BUILD COMPLETE');
      return path.resolve(runtimePath, '../');
    },
    eject: async (project: any, localDisk: IFileStorage, isReplace: boolean) => {
      const sourcePath = nodeTemplatePath;
      const destPath = path.join(project.dir, 'runtime');

      if ((await project.fileStorage.exists(destPath)) && isReplace) {
        // remove runtime folder
        await removeDirAndFiles(destPath);
      }

      if (!(await project.fileStorage.exists(destPath))) {
        // used to read bot project template from source (bundled in plugin)
        const excludeFolder = new Set<string>().add(path.resolve(sourcePath, 'node_modules'));
        await copyDir(sourcePath, localDisk, destPath, project.fileStorage, excludeFolder);
        const schemaDstPath = path.join(project.dir, 'schemas');
        const schemaSrcPath = path.join(sourcePath, 'schemas');
        const customSchemaExists = fs.existsSync(schemaDstPath);
        const pathsToExclude: Set<string> = new Set();
        if (customSchemaExists) {
          const sdkExcludePath = await localDisk.glob('sdk.schema', schemaSrcPath);
          if (sdkExcludePath.length > 0) {
            pathsToExclude.add(path.join(schemaSrcPath, sdkExcludePath[0]));
          }
        }
        await copyDir(schemaSrcPath, localDisk, schemaDstPath, project.fileStorage, pathsToExclude);
        const schemaFolderInRuntime = path.join(destPath, 'schemas');
        await removeDirAndFiles(schemaFolderInRuntime);

        return path.relative(path.join(project.dir, 'settings'), destPath);
      }
      throw new Error(`Runtime already exists at ${destPath}`);
    },
    setSkillManifest: async (
      dstRuntimePath: string,
      dstStorage: IFileStorage,
      srcManifestDir: string,
      srcStorage: IFileStorage,
      mode = 'azurewebapp'
    ) => {},
  });

  composer.addRuntimeTemplate({
    key: 'csharp-azurewebapp-v2',
    name: 'C#',
    startCommand: 'dotnet run',
    path: dotnetTemplatePath,
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
      _project: any
    ): Promise<string> => {
      // run dotnet install on the project
      const command = `dotnet add ${_project.name}.csproj package "${packageName}"${
        version ? ' --version="' + version + '"' : ''
      }${source ? ' --source="' + source + '"' : ''}`;
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
      // if (profile.type === 'azurePublish') {
      //   csproj = 'Microsoft.BotFramework.Composer.WebApp.csproj';
      // } else if (profile.type === 'azureFunctionsPublish') {
      //   csproj = 'Microsoft.BotFramework.Composer.Functions.csproj';
      // }
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

        // Don't set self-contained and runtimeIdentifier for AzureFunctions.
        // let buildCommand = `dotnet publish "${dotnetProjectPath}" -c release -o "${publishFolder}" -v q`;

        // if (profile.type === 'azurePublish')
        // {
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
      // Then, copy the declarative assets into the build artifacts folder.
      // const remoteBotPath = path.join(publishFolder, 'ComposerDialogs');
      // const localBotPath = path.join(runtimePath, 'ComposerDialogs');
      // await fs.copy(localBotPath, remoteBotPath, {
      // overwrite: true,
      // recursive: true,
      // });

      // write settings to disk in the appropriate location
      const settingsPath = path.join(publishFolder, 'settings', 'appsettings.json');
      if (!(await fs.pathExists(path.dirname(settingsPath)))) {
        await fs.mkdirp(path.dirname(settingsPath));
      }
      await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));

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
        const manifestDstDir = path.resolve(dstRuntimePath, 'azurewebapp', 'wwwroot', 'manifests');

        if (await fs.pathExists(manifestDstDir)) {
          await removeDirAndFiles(manifestDstDir);
        }

        if (await fs.pathExists(srcManifestDir)) {
          await copyDir(srcManifestDir, srcStorage, manifestDstDir, dstStorage);
        }
      }
    },
  });
};
