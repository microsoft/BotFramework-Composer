// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
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
  // register the bundled c# runtime used by the local publisher with the eject feature
  composer.addRuntimeTemplate({
    key: 'csharp-azurewebapp',
    name: 'C#',
    startCommand: 'dotnet run --project azurewebapp',
    path: path.resolve(__dirname, '../../../../runtime/dotnet'),
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
      const publishFolder = path.join(runtimePath, 'bin', 'Release', 'netcoreapp3.1');
      const deployFilePath = path.join(runtimePath, '.deployment');
      const dotnetProjectPath = path.join(runtimePath, csproj);

      // Check for existing .deployment file, if missing, write it.
      if (!(await fs.pathExists(deployFilePath))) {
        const data = `[config]\nproject = ${csproj}`;

        await fs.writeFile(deployFilePath, data);
      }

      // do the dotnet publish
      try {
        const { stdout, stderr } = await execAsync(
          `dotnet publish "${dotnetProjectPath}" -c release -o "${publishFolder}" -v q`,
          {
            cwd: runtimePath,
          }
        );
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
      const sourcePath = path.resolve(__dirname, '../../../../runtime/dotnet');
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
        return destPath;
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
    path: path.resolve(__dirname, '../../../../runtime/node'),
    build: async (runtimePath: string, _project: any) => {
      // do stuff
      composer.log('BUILD THIS JS PROJECT');
      // install dev dependencies in production, make sure typescript is installed
      const { stderr: installErr } = await execAsync('npm install && npm install --only=dev', {
        cwd: runtimePath,
      });
      if (installErr) {
        // in order to not throw warning, we just log all warning and error message
        composer.log(installErr);
      }
      const { stderr: install2Err } = await execAsync('npm run build', {
        cwd: runtimePath,
      });
      if (install2Err) {
        throw new Error(install2Err);
      }
      composer.log('BUILD COMPLETE');
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
      const sourcePath = path.resolve(__dirname, '../../../../runtime/node');
      const destPath = path.join(project.dir, 'runtime');

      if ((await project.fileStorage.exists(destPath)) && isReplace) {
        // remove runtime folder
        await removeDirAndFiles(destPath);
      }

      if (!(await project.fileStorage.exists(destPath))) {
        // used to read bot project template from source (bundled in plugin)
        const excludeFolder = new Set<string>().add(path.resolve(sourcePath, 'node_modules'));
        await copyDir(sourcePath, localDisk, destPath, project.fileStorage, excludeFolder);
        // install dev dependencies in production, make sure typescript is installed
        const { stderr: initErr } = await execAsync('npm install && npm install --only=dev', {
          cwd: destPath,
        });
        if (initErr) {
          composer.log(initErr);
        }
        const { stderr: initErr2 } = await execAsync('npm run build', { cwd: destPath });
        if (initErr2) {
          throw new Error(initErr2);
        }
        return destPath;
      } else {
        throw new Error(`Runtime already exists at ${destPath}`);
      }
    },
    setSkillManifest: async (
      dstRuntimePath: string,
      dstStorage: IFileStorage,
      srcManifestDir: string,
      srcStorage: IFileStorage,
      mode = 'azurewebapp'
    ) => {},
  });
};
