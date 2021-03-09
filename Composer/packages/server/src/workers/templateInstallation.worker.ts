// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Worker, isMainThread, workerData, parentPort } from 'worker_threads';

import Environment from 'yeoman-environment';
import yeoman from 'yeoman-environment';
import TerminalAdapter from 'yeoman-environment/lib/adapter';
import formatMessage from 'format-message';

import { templateGeneratorPath } from '../settings/env';
import log from '../logger';
import { BackgroundProcessManager } from '../services/backgroundProcessManager';

const installRemoteTemplate = async (
  yeomanEnv: Environment,
  generatorName: string,
  npmPackageName: string,
  templateVersion: string
): Promise<boolean> => {
  yeomanEnv.cwd = templateGeneratorPath;
  try {
    log('Installing generator', npmPackageName);
    templateVersion = templateVersion ? templateVersion : '*';
    await yeomanEnv.installLocalGenerators({ [npmPackageName]: templateVersion });

    log('Looking up local packages');
    await yeomanEnv.lookupLocalPackages();
    return true;
  } catch {
    return false;
  }
};

const instantiateRemoteTemplate = async (
  yeomanEnv: Environment,
  generatorName: string,
  dstDir: string,
  projectName: string
) => {
  log('About to instantiate a template!', dstDir, generatorName, projectName);
  yeomanEnv.cwd = dstDir;

  await yeomanEnv.run([generatorName, projectName], {}, () => {
    log('Template successfully instantiated', dstDir, generatorName, projectName);
  });
};

const yeomanWork = async (npmPackageName: string, templateVersion: string, dstDir: string, projectName: string) => {
  const generatorName = npmPackageName.toLowerCase().replace('generator-', '');
  // create yeoman environment
  parentPort?.postMessage({ status: formatMessage('Getting Yeoman environment') });

  const yeomanEnv = yeoman.createEnv(
    '',
    { yeomanRepository: templateGeneratorPath },
    new TerminalAdapter({ console: console })
  );
  await yeomanEnv.lookupLocalPackages();

  parentPort?.postMessage({ status: formatMessage('Installing Yeoman template') });

  const remoteTemplateAvailable = await installRemoteTemplate(
    yeomanEnv,
    generatorName,
    npmPackageName,
    templateVersion
  );
  if (remoteTemplateAvailable) {
    parentPort?.postMessage({ status: formatMessage('Instantiating Yeoman template') });

    await instantiateRemoteTemplate(yeomanEnv, generatorName, dstDir, projectName);
  } else {
    // handle error
    throw new Error(`error hit when installing remote template`);
  }
};

export function runYeomanTemplatePipeline(
  npmPackageName: string,
  templateVersion: string,
  dstDir: string,
  projectName: string,
  jobId: string
) {
  return new Promise<void>((resolve, reject) => {
    const w = new Worker(__filename, {
      workerData: { npmPackageName, templateVersion, dstDir, projectName },
    });
    w.on('exit', () => {
      resolve();
    });
    w.on('message', (message) => {
      if (message?.error) {
        reject(message.error);
      }
      if (message?.status) {
        BackgroundProcessManager.updateProcess(jobId, 202, message?.status);
      }
    });
  });
}

if (!isMainThread) {
  yeomanWork(workerData.npmPackageName, workerData.templateVersion, workerData.dstDir, workerData.projectName)
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      parentPort?.postMessage({ error: err });
      process.exit(1);
    });
}
