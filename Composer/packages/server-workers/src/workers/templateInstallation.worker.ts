// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { isMainThread, workerData, parentPort } from 'worker_threads';

import yeoman from 'yeoman-environment';
import TerminalAdapter from 'yeoman-environment/lib/adapter';

import logger from '../logger';
const log = logger.extend('templateInstallation');

const installRemoteTemplate = async (
  yeomanEnv: yeoman,
  templateGeneratorPath: string,
  npmPackageName: string,
  templateVersion: string
) => {
  yeomanEnv.cwd = templateGeneratorPath;
  try {
    log('Installing generator', npmPackageName);
    templateVersion = templateVersion ? templateVersion : '*';
    await yeomanEnv.installLocalGenerators({ [npmPackageName]: templateVersion });

    // log('Looking up local packages');
    // await yeomanEnv.lookupLocalPackages();
    return true;
  } catch {
    return false;
  }
};

const instantiateRemoteTemplate = async (
  yeomanEnv: yeoman,
  generatorName: string,
  dstDir: string,
  projectName: string
): Promise<void> => {
  log('About to instantiate a template!', dstDir, generatorName, projectName);
  yeomanEnv.cwd = dstDir;

  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore @types/yeoman-environment is outdated
    await yeomanEnv.run([generatorName, projectName, '-p', 'js', '-i', 'webapp']);
    log('Template successfully instantiated', dstDir, generatorName, projectName);
  } catch (err) {
    log('Template failed to instantiate', dstDir, generatorName, projectName);
    throw err;
  }
};

const yeomanWork = async (
  npmPackageName: string,
  templateVersion: string,
  dstDir: string,
  projectName: string,
  templateGeneratorPath: string
) => {
  const generatorName = npmPackageName.toLowerCase().replace('generator-', '');
  // create yeoman environment
  log('Getting Yeoman environment');
  parentPort?.postMessage({ status: 'Getting Yeoman environment' });

  const yeomanEnv = yeoman.createEnv(
    '',
    { yeomanRepository: templateGeneratorPath },
    new TerminalAdapter({ console: console })
  );
  log('Looking up local packages');
  yeomanEnv.lookupLocalPackages();

  log('Installing Yeoman template');
  parentPort?.postMessage({ status: 'Installing Yeoman template' });

  const remoteTemplateAvailable = await installRemoteTemplate(
    yeomanEnv,
    templateGeneratorPath,
    npmPackageName,
    templateVersion
  );
  if (remoteTemplateAvailable) {
    log('Instantiating Yeoman template');
    parentPort?.postMessage({ status: 'Instantiating Yeoman template' });

    await instantiateRemoteTemplate(yeomanEnv, generatorName, dstDir, projectName);
  } else {
    // handle error
    throw new Error(`error hit when installing remote template`);
  }
};

export type TemplateInstallationArgs = {
  npmPackageName: string;
  templateVersion: string;
  dstDir: string;
  projectName: string;
  templateGeneratorPath: string;
};

if (!isMainThread) {
  yeomanWork(
    workerData.npmPackageName,
    workerData.templateVersion,
    workerData.dstDir,
    workerData.projectName,
    workerData.templateGeneratorPath
  )
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      parentPort?.postMessage({ error: err });
      process.exit(1);
    });
}
