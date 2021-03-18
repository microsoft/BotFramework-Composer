'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const worker_threads_1 = require('worker_threads');
const yeoman_environment_1 = tslib_1.__importDefault(require('yeoman-environment'));
const adapter_1 = tslib_1.__importDefault(require('yeoman-environment/lib/adapter'));
const logger_1 = tslib_1.__importDefault(require('../logger'));
const log = logger_1.default.extend('templateInstallation');
const installRemoteTemplate = (yeomanEnv, templateGeneratorPath, npmPackageName, templateVersion) =>
  tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    yeomanEnv.cwd = templateGeneratorPath;
    try {
      log('Installing generator', npmPackageName);
      templateVersion = templateVersion ? templateVersion : '*';
      yield yeomanEnv.installLocalGenerators({ [npmPackageName]: templateVersion });
      // log('Looking up local packages');
      // await yeomanEnv.lookupLocalPackages();
      return true;
    } catch (_a) {
      return false;
    }
  });
const instantiateRemoteTemplate = (yeomanEnv, generatorName, dstDir, projectName) =>
  tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    log('About to instantiate a template!', dstDir, generatorName, projectName);
    yeomanEnv.cwd = dstDir;
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore @types/yeoman-environment is outdated
      yield yeomanEnv.run([generatorName, projectName]);
      log('Template successfully instantiated', dstDir, generatorName, projectName);
    } catch (err) {
      log('Template failed to instantiate', dstDir, generatorName, projectName);
      throw err;
    }
  });
const yeomanWork = (npmPackageName, templateVersion, dstDir, projectName, templateGeneratorPath) =>
  tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const generatorName = npmPackageName.toLowerCase().replace('generator-', '');
    // create yeoman environment
    log('Getting Yeoman environment');
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0
      ? void 0
      : worker_threads_1.parentPort.postMessage({ status: 'Getting Yeoman environment' });
    const yeomanEnv = yeoman_environment_1.default.createEnv(
      '',
      { yeomanRepository: templateGeneratorPath },
      new adapter_1.default({ console: console })
    );
    log('Looking up local packages');
    yeomanEnv.lookupLocalPackages();
    log('Installing Yeoman template');
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0
      ? void 0
      : worker_threads_1.parentPort.postMessage({ status: 'Installing Yeoman template' });
    const remoteTemplateAvailable = yield installRemoteTemplate(
      yeomanEnv,
      templateGeneratorPath,
      npmPackageName,
      templateVersion
    );
    if (remoteTemplateAvailable) {
      log('Instantiating Yeoman template');
      worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0
        ? void 0
        : worker_threads_1.parentPort.postMessage({ status: 'Instantiating Yeoman template' });
      yield instantiateRemoteTemplate(yeomanEnv, generatorName, dstDir, projectName);
    } else {
      // handle error
      throw new Error(`error hit when installing remote template`);
    }
  });
if (!worker_threads_1.isMainThread) {
  yeomanWork(
    worker_threads_1.workerData.npmPackageName,
    worker_threads_1.workerData.templateVersion,
    worker_threads_1.workerData.dstDir,
    worker_threads_1.workerData.projectName,
    worker_threads_1.workerData.templateGeneratorPath
  )
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0
        ? void 0
        : worker_threads_1.parentPort.postMessage({ error: err });
      process.exit(1);
    });
}
//# sourceMappingURL=templateInstallation.worker.js.map
