// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from 'path';
import { promisify } from 'util';

import rimraf from 'rimraf';
import * as fs from 'fs-extra';

import { copyDir } from './copyDir';
import { IFileStorage } from './interface';

const exec = promisify(require('child_process').exec);

const removeDirAndFiles = promisify(rimraf);

export default async (composer: any): Promise<void> => {
  // register the bundled c# runtime used by the local publisher with the eject feature
  composer.addRuntimeTemplate({
    key: 'csharp-azurewebapp',
    name: 'C#',
    startCommand: 'dotnet run --project azurewebapp',
    path: path.resolve(__dirname, '../../../../runtime/dotnet'),
    build: async (runtimePath: string, _project: any) => {
      // TODO: copy source into temporary folder
      // copyDir(path.resolve(__dirname, '../../../../../runtime/dotnet'), runtimePath);

      // do stuff
      composer.log(`BUILD THIS C# PROJECT! at ${runtimePath}...`);
      composer.log('Run dotnet user-secrets init...');
      // TODO: capture output of this and store it somewhere useful
      const { initOut, initErr } = await exec('dotnet user-secrets init --project azurewebapp', {
        cwd: runtimePath,
      });
      if (initErr) {
        throw new Error(initErr);
      }
      composer.log('Run dotnet build...');
      const { buildOut, buildErr } = await exec('dotnet build', { cwd: runtimePath });
      if (buildErr) {
        throw new Error(buildErr);
      }
      composer.log('FINISHED BUILDING!');
    },
    run: async (project: any, localDisk: IFileStorage) => {
      // do stuff
      composer.log('RUN THIS C# PROJECT!');
    },
    buildDeploy: async (runtimePath: string, project: any, settings: any, profileName: string): Promise<string> => {
      composer.log('BUILD FOR DEPLOY TO AZURE!');

      let csproj = '';
      // find publishing profile in list
      const profile = project.settings.publishTargets.find((p) => p.name === profileName);
      if (profile.type === 'plugin-azure-publish') {
        csproj = 'Microsoft.BotFramework.Composer.WebApp.csproj';
      } else if (profile.type === 'plugin-azure-functions-publish') {
        csproj = 'Microsoft.BotFramework.Composer.Functions.csproj';
      }
      const publishFolder = path.join(runtimePath, 'bin', 'Release', 'netcoreapp3.1');
      const deployFilePath = path.join(runtimePath, '.deployment');
      const dotnetProjectPath = path.join(runtimePath, csproj);

      // Check for existing .deployment file, if missing, write it.
      if (!fs.pathExistsSync(deployFilePath)) {
        const data = `[config]\nproject = ${csproj}`;

        fs.writeFileSync(deployFilePath, data);
      }

      // do the dotnet publish
      try {
        const { stdout, stderr } = await exec(
          `dotnet publish "${dotnetProjectPath}" -c release -o "${publishFolder}" -v q`,
          {
            cwd: runtimePath,
          }
        );
        composer.log('OUTPUT FROM BUILD', stdout);
        if (stderr) {
          console.error('ERR FROM BUILD: ', stderr);
        }
      } catch (err) {
        console.error('Error doing dotnet publish', err);
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
      // Set the bot and root fields to `ComposerDialogs` - this points the runtime to the appropriate deployed location
      // todo: are both necessary?
      Object.assign(settings, { bot: 'ComposerDialogs', root: 'ComposerDialogs' });
      if (!(await fs.pathExists(path.dirname(settingsPath)))) {
        fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
      }
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

      // return the location of the build artifiacts
      return publishFolder;
    },
    eject: async (project, localDisk: IFileStorage) => {
      const sourcePath = path.resolve(__dirname, '../../../../runtime/dotnet');
      const destPath = path.join(project.dir, 'runtime');
      if (!(await project.fileStorage.exists(destPath))) {
        // used to read bot project template from source (bundled in plugin)
        await copyDir(sourcePath, localDisk, destPath, project.fileStorage);
        const schemaDstPath = path.join(project.dir, 'schemas');
        const schemaSrcPath = path.join(sourcePath, 'azurewebapp/schemas');
        const customSchemaExists = fs.existsSync(schemaDstPath);
        const pathsToExclude: Set<string> = new Set();
        if (customSchemaExists) {
          const sdkExcludePath = await localDisk.glob('sdk.schema', schemaSrcPath);
          if (sdkExcludePath.length > 0) {
            pathsToExclude.add(path.join(schemaSrcPath, sdkExcludePath[0]));
          }
        }
        await copyDir(schemaSrcPath, localDisk, schemaDstPath, project.fileStorage, pathsToExclude);
        const schemaFolderInRuntime = path.join(destPath, 'azurewebapp/schemas');
        await removeDirAndFiles(schemaFolderInRuntime);
        return destPath;
      }
      throw new Error(`Runtime already exists at ${destPath}`);
    },
  });

  composer.addRuntimeTemplate({
    key: 'node-azurewebapp',
    name: 'JS',
    startCommand: 'node azurewebapp/lib/index.js',
    path: path.resolve(__dirname, '../../../../runtime/node'),
    build: async (runtimePath: string, _project: any) => {
      // do stuff
      composer.log('BUILD THIS JS PROJECT');
      const { installOut, installErr } = await exec('yarn', {
        cwd: runtimePath,
        stdio: 'pipe',
      });
      // const { install2Out, install2Err } = await exec('npm install', {
      //   cwd: path.join(runtimePath, '/azurewebapp'),
      // });
      composer.log('BUILD COMPLETE');
    },
    run: async (project: any, localDisk: IFileStorage) => {
      // do stuff
    },
    buildDeploy: async (runtimePath: string, project: any, settings: any, profileName: string): Promise<string> => {
      // do stuff
      composer.log('BUILD THIS JS PROJECT');
      const { installOut, installErr } = await exec('yarn', { cwd: runtimePath, stdio: 'pipe' });
      // const { install2Out, install2Err } = exec('npm install', {
      //   cwd: path.join(runtimePath, '/azurewebapp'),
      // });

      // write settings to disk in the appropriate location
      const settingsPath = path.join(runtimePath, 'ComposerDialogs', 'settings', 'appsettings.json');
      // Set the bot and root fields to `ComposerDialogs` - this points the runtime to the appropriate deployed location
      // todo: are both necessary?
      Object.assign(settings, { bot: 'ComposerDialogs', root: 'ComposerDialogs' });
      if (!(await fs.pathExists(path.dirname(settingsPath)))) {
        fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
      }
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

      composer.log('BUILD COMPLETE');
      return '';
    },
    eject: async (project: any, localDisk: IFileStorage) => {
      const sourcePath = path.resolve(__dirname, '../../../../runtime/node');
      const destPath = path.join(project.dir, 'runtime');
      // const schemaSrcPath = path.join(sourcePath, 'azurewebapp/Schemas');
      // const schemaDstPath = path.join(project.dir, 'schemas');
      if (!(await project.fileStorage.exists(destPath))) {
        // used to read bot project template from source (bundled in plugin)
        const excludeFolder = new Set<string>()
          .add(path.resolve(sourcePath, 'node_modules'))
          .add(path.resolve(sourcePath, 'azurewebapp/node_modules'));
        await copyDir(sourcePath, localDisk, destPath, project.fileStorage, excludeFolder);
        // await copyDir(schemaSrcPath, localDisk, schemaDstPath, project.fileStorage);
        return destPath;
      } else {
        throw new Error(`Runtime already exists at ${destPath}`);
      }
    },
  });
};
