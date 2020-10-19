"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const child_process_1 = require("child_process");
const rimraf_1 = __importDefault(require("rimraf"));
const fs = __importStar(require("fs-extra"));
const copyDir_1 = require("./copyDir");
const execAsync = util_1.promisify(child_process_1.exec);
const removeDirAndFiles = util_1.promisify(rimraf_1.default);
exports.default = (composer) => __awaiter(void 0, void 0, void 0, function* () {
    // register the bundled c# runtime used by the local publisher with the eject feature
    composer.addRuntimeTemplate({
        key: 'csharp-azurewebapp',
        name: 'C#',
        startCommand: 'dotnet run --project azurewebapp',
        path: path_1.default.resolve(__dirname, '../../../../runtime/dotnet'),
        build: (runtimePath, _project) => __awaiter(void 0, void 0, void 0, function* () {
            composer.log(`BUILD THIS C# PROJECT! at ${runtimePath}...`);
            composer.log('Run dotnet user-secrets init...');
            // TODO: capture output of this and store it somewhere useful
            const { stderr: initErr } = yield execAsync('dotnet user-secrets init --project azurewebapp', {
                cwd: runtimePath,
            });
            if (initErr) {
                throw new Error(initErr);
            }
            composer.log('Run dotnet build...');
            const { stderr: buildErr } = yield execAsync('dotnet build', { cwd: runtimePath });
            if (buildErr) {
                throw new Error(buildErr);
            }
            composer.log('FINISHED BUILDING!');
        }),
        run: (project, localDisk) => __awaiter(void 0, void 0, void 0, function* () {
            composer.log('RUN THIS C# PROJECT!');
        }),
        buildDeploy: (runtimePath, project, settings, profileName) => __awaiter(void 0, void 0, void 0, function* () {
            composer.log('BUILD FOR DEPLOY TO AZURE!');
            let csproj = '';
            // find publishing profile in list
            const profile = project.settings.publishTargets.find((p) => p.name === profileName);
            if (profile.type === 'azurePublish') {
                csproj = 'Microsoft.BotFramework.Composer.WebApp.csproj';
            }
            else if (profile.type === 'azureFunctionsPublish') {
                csproj = 'Microsoft.BotFramework.Composer.Functions.csproj';
            }
            const publishFolder = path_1.default.join(runtimePath, 'bin', 'Release', 'netcoreapp3.1');
            const deployFilePath = path_1.default.join(runtimePath, '.deployment');
            const dotnetProjectPath = path_1.default.join(runtimePath, csproj);
            // Check for existing .deployment file, if missing, write it.
            if (!(yield fs.pathExists(deployFilePath))) {
                const data = `[config]\nproject = ${csproj}`;
                yield fs.writeFile(deployFilePath, data);
            }
            // do the dotnet publish
            try {
                const { stdout, stderr } = yield execAsync(`dotnet publish "${dotnetProjectPath}" -c release -o "${publishFolder}" -v q`, {
                    cwd: runtimePath,
                });
                composer.log('OUTPUT FROM BUILD', stdout);
                if (stderr) {
                    composer.log('ERR FROM BUILD: ', stderr);
                }
            }
            catch (err) {
                composer.log('Error doing dotnet publish', err);
                throw err;
                return;
            }
            // Then, copy the declarative assets into the build artifacts folder.
            const remoteBotPath = path_1.default.join(publishFolder, 'ComposerDialogs');
            const localBotPath = path_1.default.join(runtimePath, 'ComposerDialogs');
            yield fs.copy(localBotPath, remoteBotPath, {
                overwrite: true,
                recursive: true,
            });
            // write settings to disk in the appropriate location
            const settingsPath = path_1.default.join(publishFolder, 'ComposerDialogs', 'settings', 'appsettings.json');
            if (!(yield fs.pathExists(path_1.default.dirname(settingsPath)))) {
                yield fs.mkdirp(path_1.default.dirname(settingsPath));
            }
            yield fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
            // return the location of the build artifiacts
            return publishFolder;
        }),
        eject: (project, localDisk, isReplace) => __awaiter(void 0, void 0, void 0, function* () {
            const sourcePath = path_1.default.resolve(__dirname, '../../../../runtime/dotnet');
            const destPath = path_1.default.join(project.dir, 'runtime');
            if ((yield project.fileStorage.exists(destPath)) && isReplace) {
                // remove runtime folder
                yield removeDirAndFiles(destPath);
            }
            if (!(yield project.fileStorage.exists(destPath))) {
                // used to read bot project template from source (bundled in plugin)
                yield copyDir_1.copyDir(sourcePath, localDisk, destPath, project.fileStorage);
                const schemaDstPath = path_1.default.join(project.dir, 'schemas');
                const schemaSrcPath = path_1.default.join(sourcePath, 'azurewebapp/Schemas');
                const customSchemaExists = fs.existsSync(schemaDstPath);
                const pathsToExclude = new Set();
                if (customSchemaExists) {
                    const sdkExcludePath = yield localDisk.glob('sdk.schema', schemaSrcPath);
                    if (sdkExcludePath.length > 0) {
                        pathsToExclude.add(path_1.default.join(schemaSrcPath, sdkExcludePath[0]));
                    }
                }
                yield copyDir_1.copyDir(schemaSrcPath, localDisk, schemaDstPath, project.fileStorage, pathsToExclude);
                const schemaFolderInRuntime = path_1.default.join(destPath, 'azurewebapp/Schemas');
                yield removeDirAndFiles(schemaFolderInRuntime);
                return destPath;
            }
            throw new Error(`Runtime already exists at ${destPath}`);
        }),
        setSkillManifest: (dstRuntimePath, dstStorage, srcManifestDir, srcStorage, mode = 'azurewebapp' // set default as azurewebapp
        ) => __awaiter(void 0, void 0, void 0, function* () {
            // update manifst into runtime wwwroot
            if (mode === 'azurewebapp') {
                const manifestDstDir = path_1.default.resolve(dstRuntimePath, 'azurewebapp', 'wwwroot', 'manifests');
                if (yield fs.pathExists(manifestDstDir)) {
                    yield removeDirAndFiles(manifestDstDir);
                }
                if (yield fs.pathExists(srcManifestDir)) {
                    yield copyDir_1.copyDir(srcManifestDir, srcStorage, manifestDstDir, dstStorage);
                }
            }
        }),
    });
    composer.addRuntimeTemplate({
        key: 'node-azurewebapp',
        name: 'JS (preview)',
        startCommand: 'node ./lib/webapp.js',
        path: path_1.default.resolve(__dirname, '../../../../runtime/node'),
        build: (runtimePath, _project) => __awaiter(void 0, void 0, void 0, function* () {
            // do stuff
            composer.log('BUILD THIS JS PROJECT');
            // install dev dependencies in production, make sure typescript is installed
            const { stderr: installErr } = yield execAsync('npm install && npm install --only=dev', {
                cwd: runtimePath,
            });
            if (installErr) {
                // in order to not throw warning, we just log all warning and error message
                composer.log(installErr);
            }
            const { stderr: install2Err } = yield execAsync('npm run build', {
                cwd: runtimePath,
            });
            if (install2Err) {
                throw new Error(install2Err);
            }
            composer.log('BUILD COMPLETE');
        }),
        run: (project, localDisk) => __awaiter(void 0, void 0, void 0, function* () {
            // do stuff
        }),
        buildDeploy: (runtimePath, project, settings, profileName) => __awaiter(void 0, void 0, void 0, function* () {
            // do stuff
            composer.log('BUILD THIS JS PROJECT');
            const { stderr: installErr } = yield execAsync('npm install', {
                cwd: path_1.default.resolve(runtimePath, '../'),
            });
            if (installErr) {
                composer.log(installErr);
            }
            const { stderr: install2Err } = yield execAsync('npm run build', {
                cwd: path_1.default.resolve(runtimePath, '../'),
            });
            if (install2Err) {
                throw new Error(install2Err);
            }
            // write settings to disk in the appropriate location
            const settingsPath = path_1.default.join(runtimePath, 'ComposerDialogs', 'settings', 'appsettings.json');
            if (!(yield fs.pathExists(path_1.default.dirname(settingsPath)))) {
                yield fs.mkdirp(path_1.default.dirname(settingsPath));
            }
            yield fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
            composer.log('BUILD COMPLETE');
            return path_1.default.resolve(runtimePath, '../');
        }),
        eject: (project, localDisk, isReplace) => __awaiter(void 0, void 0, void 0, function* () {
            const sourcePath = path_1.default.resolve(__dirname, '../../../../runtime/node');
            const destPath = path_1.default.join(project.dir, 'runtime');
            if ((yield project.fileStorage.exists(destPath)) && isReplace) {
                // remove runtime folder
                yield removeDirAndFiles(destPath);
            }
            if (!(yield project.fileStorage.exists(destPath))) {
                // used to read bot project template from source (bundled in plugin)
                const excludeFolder = new Set().add(path_1.default.resolve(sourcePath, 'node_modules'));
                yield copyDir_1.copyDir(sourcePath, localDisk, destPath, project.fileStorage, excludeFolder);
                // install dev dependencies in production, make sure typescript is installed
                const { stderr: initErr } = yield execAsync('npm install && npm install --only=dev', {
                    cwd: destPath,
                });
                if (initErr) {
                    composer.log(initErr);
                }
                const { stderr: initErr2 } = yield execAsync('npm run build', { cwd: destPath });
                if (initErr2) {
                    throw new Error(initErr2);
                }
                return destPath;
            }
            else {
                throw new Error(`Runtime already exists at ${destPath}`);
            }
        }),
        setSkillManifest: (dstRuntimePath, dstStorage, srcManifestDir, srcStorage, mode = 'azurewebapp') => __awaiter(void 0, void 0, void 0, function* () { }),
    });
});
//# sourceMappingURL=index.js.map