"use strict";
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
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const globby_1 = __importDefault(require("globby"));
const rimraf_1 = __importDefault(require("rimraf"));
const archiver_1 = __importDefault(require("archiver"));
const uuid_1 = require("uuid");
const adm_zip_1 = __importDefault(require("adm-zip"));
const portfinder_1 = __importDefault(require("portfinder"));
const copyDir_1 = require("./copyDir");
const stat = util_1.promisify(fs_1.default.stat);
const readDir = util_1.promisify(fs_1.default.readdir);
const removeFile = util_1.promisify(fs_1.default.unlink);
const mkDir = util_1.promisify(fs_1.default.mkdir);
const removeDirAndFiles = util_1.promisify(rimraf_1.default);
const copyFile = util_1.promisify(fs_1.default.copyFile);
const isWin = process.platform === 'win32';
let LocalPublisher = /** @class */ (() => {
    class LocalPublisher {
        constructor(composer) {
            this.baseDir = path_1.default.resolve(__dirname, '../');
            // config include botId and version, project is content(ComposerDialogs)
            this.publish = (config, project, metadata, user) => __awaiter(this, void 0, void 0, function* () {
                const { templatePath, fullSettings } = config;
                this.templatePath = templatePath;
                const botId = project.id;
                const version = 'default';
                this.composer.log('Starting publish');
                // if enableCustomRuntime is not true, initialize the runtime code in a tmp folder
                // and export the content into that folder as well.
                if (!project.settings.runtime || project.settings.runtime.customRuntime !== true) {
                    this.composer.log('Using managed runtime');
                    yield this.initBot(botId);
                    yield this.saveContent(botId, version, project.dataDir, user);
                    yield this.saveSkillManifests(this.getBotRuntimeDir(botId), project.dataDir);
                }
                else if (project.settings.runtime.path && project.settings.runtime.command) {
                    // update manifst into runtime wwwroot
                    yield this.saveSkillManifests(project.settings.runtime.path, project.dataDir);
                }
                else {
                    return {
                        status: 400,
                        result: {
                            message: 'Custom runtime settings are incomplete. Please specify path and command.',
                        },
                    };
                }
                try {
                    // start or restart the bot process
                    const url = yield this.setBot(botId, version, fullSettings, project.dataDir);
                    return {
                        status: 200,
                        result: {
                            id: uuid_1.v4(),
                            endpointURL: url,
                            message: 'Local publish success.',
                        },
                    };
                }
                catch (error) {
                    console.error('Error in local publish', error);
                    return {
                        status: 500,
                        result: {
                            message: error,
                        },
                    };
                }
            });
            this.getStatus = (config, project, user) => __awaiter(this, void 0, void 0, function* () {
                const botId = project.id;
                if (LocalPublisher.runningBots[botId]) {
                    const port = LocalPublisher.runningBots[botId].port;
                    const url = `http://localhost:${port}`;
                    return {
                        status: 200,
                        result: {
                            message: 'Running',
                            endpointURL: url,
                        },
                    };
                }
                else {
                    return {
                        status: 200,
                        result: {
                            message: 'Ready',
                        },
                    };
                }
            });
            this.removeRuntimeData = (botId) => __awaiter(this, void 0, void 0, function* () {
                const targetDir = path_1.default.resolve(__dirname, `../hostedBots/${botId}`);
                if (!(yield this.dirExist(targetDir))) {
                    return { msg: `runtime path ${targetDir} does not exist` };
                }
                try {
                    yield removeDirAndFiles(targetDir);
                    return { msg: `successfully removed runtime data in ${targetDir}` };
                }
                catch (e) {
                    throw new Error(`Failed to remove ${targetDir}`);
                }
            });
            this.getBotsDir = () => process.env.LOCAL_PUBLISH_PATH || path_1.default.resolve(this.baseDir, 'hostedBots');
            this.getBotDir = (botId) => path_1.default.resolve(this.getBotsDir(), botId);
            this.getBotRuntimeDir = (botId) => path_1.default.resolve(this.getBotDir(botId), 'runtime');
            this.getBotAssetsDir = (botId) => path_1.default.resolve(this.getBotDir(botId));
            this.getHistoryDir = (botId) => path_1.default.resolve(this.getBotDir(botId), 'history');
            this.getManifestSrcDir = (srcDir) => path_1.default.resolve(srcDir, 'manifests');
            this.getManifestDstDir = (baseDir) => path_1.default.resolve(baseDir, 'azurewebapp', 'wwwroot', 'manifests');
            this.getDownloadPath = (botId, version) => path_1.default.resolve(this.getHistoryDir(botId), `${version}.zip`);
            this.botExist = (botId) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const status = yield stat(this.getBotDir(botId));
                    return status.isDirectory();
                }
                catch (error) {
                    return false;
                }
            });
            this.dirExist = (dirPath) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const status = yield stat(dirPath);
                    return status.isDirectory();
                }
                catch (error) {
                    return false;
                }
            });
            this.initBot = (botId) => __awaiter(this, void 0, void 0, function* () {
                this.composer.log('Initializing bot');
                const isExist = yield this.botExist(botId);
                if (!isExist) {
                    const botDir = this.getBotDir(botId);
                    const runtimeDir = this.getBotRuntimeDir(botId);
                    // create bot dir
                    yield mkDir(botDir, { recursive: true });
                    yield mkDir(runtimeDir, { recursive: true });
                    // create ComposerDialogs and history folder
                    mkDir(this.getBotAssetsDir(botId), { recursive: true });
                    mkDir(this.getHistoryDir(botId), { recursive: true });
                    // copy runtime template in folder
                    yield this.copyDir(this.templatePath, runtimeDir);
                    try {
                        // TODO ccastro: discuss with benbrown. Consider init command as template metadata. Remove azurewebapp from here.
                        child_process_1.execSync('dotnet user-secrets init --project azurewebapp', { cwd: runtimeDir, stdio: 'pipe' });
                        child_process_1.execSync('dotnet build', { cwd: runtimeDir, stdio: 'pipe' });
                    }
                    catch (error) {
                        // delete the folder to make sure build again.
                        yield removeDirAndFiles(botDir);
                        throw new Error(error.toString());
                    }
                }
            });
            this.saveContent = (botId, version, srcDir, user) => __awaiter(this, void 0, void 0, function* () {
                this.composer.log('Packaging bot assets');
                const dstPath = this.getDownloadPath(botId, version);
                yield this.zipBot(dstPath, srcDir);
            });
            this.saveSkillManifests = (dstPath, srcDir) => __awaiter(this, void 0, void 0, function* () {
                const manifestSrcDir = this.getManifestSrcDir(srcDir);
                const manifestDstDir = this.getManifestDstDir(dstPath);
                if (yield this.dirExist(manifestDstDir)) {
                    yield removeDirAndFiles(manifestDstDir);
                }
                if (yield this.dirExist(manifestSrcDir)) {
                    this.copyDir(manifestSrcDir, manifestDstDir);
                }
            });
            // start bot in current version
            this.setBot = (botId, version, settings, project = undefined) => __awaiter(this, void 0, void 0, function* () {
                // get port, and stop previous bot if exist
                let port;
                if (LocalPublisher.runningBots[botId]) {
                    this.composer.log('Bot already running. Stopping bot...');
                    port = LocalPublisher.runningBots[botId].port;
                    this.stopBot(botId);
                }
                else {
                    port = yield portfinder_1.default.getPortPromise({ port: 3979, stopPort: 5000 });
                }
                // if not using custom runtime, update assets in tmp older
                if (!settings.runtime || settings.runtime.customRuntime !== true) {
                    this.composer.log('Updating bot assets');
                    yield this.restoreBot(botId, version);
                }
                // start the bot process
                try {
                    yield this.startBot(botId, port, settings);
                    return `http://localhost:${port}`;
                }
                catch (error) {
                    this.stopBot(botId);
                    throw error;
                }
            });
            this.startBot = (botId, port, settings) => __awaiter(this, void 0, void 0, function* () {
                const botDir = settings.runtime && settings.runtime.customRuntime === true
                    ? settings.runtime.path
                    : this.getBotRuntimeDir(botId);
                const commandAndArgs = settings.runtime && settings.runtime.customRuntime === true
                    ? settings.runtime.command.split(/\s+/)
                    : ['dotnet', 'run', '--project', 'azurewebapp']; //TODO: ccastro should pick up the bot start command here. After, remove azurewebapp arg
                return new Promise((resolve, reject) => {
                    // ensure the specified runtime path exists
                    if (!fs_1.default.existsSync(botDir)) {
                        reject(`Runtime path ${botDir} does not exist.`);
                    }
                    // take the 0th item off the array, leaving just the args
                    this.composer.log('Starting bot on port %d. (%s)', port, commandAndArgs.join(' '));
                    const startCommand = commandAndArgs.shift();
                    let process;
                    try {
                        process = child_process_1.spawn(startCommand, [...commandAndArgs, `--urls`, `http://0.0.0.0:${port}`, ...this.getConfig(settings)], {
                            cwd: botDir,
                            stdio: ['ignore', 'pipe', 'pipe'],
                            detached: !isWin,
                        });
                        this.composer.log('Started process %d', process.pid);
                    }
                    catch (err) {
                        return reject(err);
                    }
                    LocalPublisher.runningBots[botId] = { process: process, port: port };
                    const processLog = this.composer.log.extend(process.pid);
                    this.addListeners(process, processLog, resolve, reject);
                });
            });
            this.getConfig = (config) => {
                const configList = [];
                if (config.MicrosoftAppPassword) {
                    configList.push('--MicrosoftAppPassword');
                    configList.push(config.MicrosoftAppPassword);
                }
                if (config.luis) {
                    configList.push('--luis:endpointKey');
                    configList.push(config.luis.endpointKey || config.luis.authoringKey);
                }
                return configList;
            };
            this.addListeners = (child, 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            logger, resolve, reject) => {
                let erroutput = '';
                child.stdout &&
                    child.stdout.on('data', (data) => {
                        logger('%s', data);
                        resolve(child.pid);
                    });
                child.stderr &&
                    child.stderr.on('data', (err) => {
                        erroutput += err.toString();
                    });
                child.on('exit', (code) => {
                    if (code !== 0) {
                        reject(erroutput);
                    }
                });
                child.on('error', (err) => {
                    logger('error: %s', err.message);
                    reject(`Could not launch bot runtime process: ${err.message}`);
                });
                child.on('message', (msg) => {
                    logger('%s', msg);
                });
            };
            this.restoreBot = (botId, version) => __awaiter(this, void 0, void 0, function* () {
                const srcPath = this.getDownloadPath(botId, version);
                const dstPath = this.getBotAssetsDir(botId);
                yield this.unZipBot(srcPath, dstPath);
            });
            this.zipBot = (dstPath, srcDir) => __awaiter(this, void 0, void 0, function* () {
                // delete previous and create new
                if (fs_1.default.existsSync(dstPath)) {
                    yield removeFile(dstPath);
                }
                const files = yield globby_1.default('**/*', { cwd: srcDir, dot: true, ignore: ['runtime'] });
                return new Promise((resolve, reject) => {
                    const archive = archiver_1.default('zip');
                    const output = fs_1.default.createWriteStream(dstPath);
                    archive.pipe(output);
                    for (const file of files) {
                        archive.append(fs_1.default.createReadStream(path_1.default.join(srcDir, file)), { name: file });
                    }
                    archive.finalize();
                    output.on('close', () => resolve(dstPath));
                    output.on('error', (err) => {
                        reject(err);
                    });
                });
            });
            this.unZipBot = (srcPath, dstPath) => __awaiter(this, void 0, void 0, function* () {
                if (!fs_1.default.existsSync(srcPath)) {
                    throw new Error('no such version bot');
                }
                const zip = new adm_zip_1.default(srcPath);
                zip.extractAllTo(dstPath, true);
            });
            this.stopBot = (botId) => {
                var _a;
                const proc = (_a = LocalPublisher.runningBots[botId]) === null || _a === void 0 ? void 0 : _a.process;
                if (proc) {
                    this.composer.log('Killing process %d', -proc.pid);
                    // Kill the bot process AND all child processes
                    try {
                        process.kill(isWin ? proc.pid : -proc.pid);
                    }
                    catch (err) {
                        // ESRCH means pid not found
                        // this throws an error but doesn't indicate failure for us
                        if (err.code !== 'ESRCH') {
                            throw err;
                        }
                    }
                }
                delete LocalPublisher.runningBots[botId];
            };
            this.copyDir = (srcDir, dstDir) => __awaiter(this, void 0, void 0, function* () {
                if (!(yield this.dirExist(srcDir))) {
                    throw new Error(`no such dir ${srcDir}`);
                }
                if (!(yield this.dirExist(dstDir))) {
                    yield mkDir(dstDir, { recursive: true });
                }
                const paths = yield readDir(srcDir);
                for (const subPath of paths) {
                    const srcPath = path_1.default.resolve(srcDir, subPath);
                    const dstPath = path_1.default.resolve(dstDir, subPath);
                    if (!(yield stat(srcPath)).isDirectory()) {
                        // copy files
                        yield copyFile(srcPath, dstPath);
                    }
                    else {
                        // recursively copy dirs
                        yield this.copyDir(srcPath, dstPath);
                    }
                }
            });
            this.composer = composer;
        }
    }
    LocalPublisher.runningBots = {};
    LocalPublisher.stopAll = () => {
        for (const botId in LocalPublisher.runningBots) {
            const bot = LocalPublisher.runningBots[botId];
            // Kill the bot process AND all child processes
            try {
                process.kill(isWin ? bot.process.pid : -bot.process.pid);
            }
            catch (err) {
                // swallow this error which happens if the child process is already gone
            }
            delete LocalPublisher.runningBots[botId];
        }
    };
    return LocalPublisher;
})();
exports.default = (composer) => __awaiter(void 0, void 0, void 0, function* () {
    const publisher = new LocalPublisher(composer);
    // register this publishing method with Composer
    yield composer.addPublishMethod(publisher);
    // register the bundled c# runtime used by the local publisher with the eject feature
    composer.addRuntimeTemplate({
        key: 'azurewebapp',
        name: 'C#',
        startCommand: 'dotnet run --project azurewebapp',
        eject: (project, localDisk) => __awaiter(void 0, void 0, void 0, function* () {
            const sourcePath = path_1.default.resolve(__dirname, '../../../../runtime/dotnet');
            const destPath = path_1.default.join(project.dir, 'runtime');
            if (!(yield project.fileStorage.exists(destPath))) {
                // used to read bot project template from source (bundled in plugin)
                yield copyDir_1.copyDir(sourcePath, localDisk, destPath, project.fileStorage);
                const schemaDstPath = path_1.default.join(project.dir, 'schemas');
                const schemaSrcPath = path_1.default.join(sourcePath, 'azurewebapp/schemas');
                const customSchemaExists = fs_1.default.existsSync(schemaDstPath);
                const pathsToExclude = new Set();
                if (customSchemaExists) {
                    const sdkExcludePath = yield localDisk.glob('sdk.schema', schemaSrcPath);
                    if (sdkExcludePath.length > 0) {
                        pathsToExclude.add(path_1.default.join(schemaSrcPath, sdkExcludePath[0]));
                    }
                }
                yield copyDir_1.copyDir(schemaSrcPath, localDisk, schemaDstPath, project.fileStorage, pathsToExclude);
                const schemaFolderInRuntime = path_1.default.join(destPath, 'azurewebapp/schemas');
                yield removeDirAndFiles(schemaFolderInRuntime);
                return destPath;
            }
            throw new Error(`Runtime already exists at ${destPath}`);
        }),
    });
});
// stop all the runningBot when process exit
const cleanup = () => {
    LocalPublisher.stopAll();
    process.exit(0);
};
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
    process.on(signal, cleanup.bind(null, signal));
});
//# sourceMappingURL=index.js.map