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
  // register the base template which will appear in the NEw Bot modal
  composer.addBotTemplate({
    id: 'va-core',
    name: 'VA Core',
    description: 'The core of your new VA - ready to run, just add skills!',
    path: path.resolve(__dirname, '../template'),
  });

  // register the bundled va runtime used by the local publisher with the eject feature
  composer.addRuntimeTemplate({
    key: 'va-core',
    name: 'VA',
    startCommand: 'dotnet run --project azurewebapp',
    path: path.resolve(__dirname, '../template/runtime'),
    build: async (runtimePath: string, _project: any) => {

      // copyDir(path.resolve(__dirname, '../../../../../runtime/dotnet'), runtimePath);

      // do stuff
      composer.log(`BUILD THIS VA CORE! at ${runtimePath}...`);
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
      composer.log('RUN THIS VA CORE PROJECT!');
    },
    buildDeploy: async (runtimePath: string, project: any, settings: any, profileName: string): Promise<string> => {
      composer.log('BUILD FOR DEPLOY VA CORE TO AZURE!');

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
      const sourcePath = path.resolve(__dirname, '../template/runtime');
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

};
