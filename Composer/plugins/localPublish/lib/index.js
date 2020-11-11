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
const stat = util_1.promisify(fs_1.default.stat);
const readDir = util_1.promisify(fs_1.default.readdir);
const removeFile = util_1.promisify(fs_1.default.unlink);
const mkDir = util_1.promisify(fs_1.default.mkdir);
const removeDirAndFiles = util_1.promisify(rimraf_1.default);
const copyFile = util_1.promisify(fs_1.default.copyFile);
const readFile = util_1.promisify(fs_1.default.readFile);
const isWin = process.platform === 'win32';
let LocalPublisher = /** @class */ (() => {
    class LocalPublisher {
        constructor(composer) {
            this.baseDir = path_1.default.resolve(__dirname, '../');
            this.setBotStatus = (botId, status) => {
                this.composer.log(`SETTING STATUS OF ${botId} to port ${status.port} and status ${status.status}`);
                // preserve the pid and port if one is available
                if (!status.process && LocalPublisher.runningBots[botId] && LocalPublisher.runningBots[botId].process) {
                    status.process = LocalPublisher.runningBots[botId].process;
                }
                if (!status.port && LocalPublisher.runningBots[botId] && LocalPublisher.runningBots[botId].port) {
                    status.port = LocalPublisher.runningBots[botId].port;
                }
                LocalPublisher.runningBots[botId] = status;
            };
            this.publishAsync = (botId, version, fullSettings, project, user) => __awaiter(this, void 0, void 0, function* () {
                try {
                    // if enableCustomRuntime is not true, initialize the runtime code in a tmp folder
                    // and export the content into that folder as well.
                    const runtime = this.composer.getRuntimeByProject(project);
                    if (!project.settings.runtime || project.settings.runtime.customRuntime !== true) {
                        this.composer.log('Using managed runtime');
                        yield this.initBot(project);
                        yield this.saveContent(botId, version, project.dataDir, user);
                        yield runtime.setSkillManifest(this.getBotRuntimeDir(botId), project.fileStorage, this.getManifestSrcDir(project.dataDir), project.fileStorage);
                    }
                    else if (project.settings.runtime.path && project.settings.runtime.command) {
                        yield runtime.setSkillManifest(project.settings.runtime.path, project.fileStorage, this.getManifestSrcDir(project.dataDir), project.fileStorage);
                    }
                    else {
                        throw new Error('Custom runtime settings are incomplete. Please specify path and command.');
                    }
                    yield this.setBot(botId, version, fullSettings, project);
                }
                catch (error) {
                    this.stopBot(botId);
                    this.setBotStatus(botId, {
                        status: 500,
                        result: {
                            message: error.message,
                        },
                    });
                }
            });
            // config include botId and version, project is content(ComposerDialogs)
            this.publish = (config, project, metadata, user) => __awaiter(this, void 0, void 0, function* () {
                const { fullSettings } = config;
                const botId = project.id;
                const version = 'default';
                this.composer.log('Starting publish');
                // set the running bot status
                this.setBotStatus(botId, { status: 202, result: { message: 'Reloading...' } });
                try {
                    // start or restart the bot process
                    // do NOT await this, as it can take a long time
                    this.publishAsync(botId, version, fullSettings, project, user);
                    return {
                        status: 202,
                        result: {
                            id: uuid_1.v4(),
                            message: 'Local publish success.',
                        },
                    };
                }
                catch (error) {
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
                    if (LocalPublisher.runningBots[botId].status === 200) {
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
                        const status = {
                            status: LocalPublisher.runningBots[botId].status,
                            result: LocalPublisher.runningBots[botId].result,
                        };
                        if (LocalPublisher.runningBots[botId].status === 500) {
                            // after we return the 500 status once, delete it out of the running bots list.
                            delete LocalPublisher.runningBots[botId];
                        }
                        return status;
                    }
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
            this.initBot = (project) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                this.composer.log('Initializing bot');
                const botId = project.id;
                const isExist = yield this.botExist(botId);
                // get runtime template
                const runtime = this.composer.getRuntimeByProject(project);
                try {
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
                        this.composer.log('COPY FROM ', runtime.path, ' to ', runtimeDir);
                        yield this.copyDir(runtime.path, runtimeDir);
                        yield runtime.build(runtimeDir, project);
                    }
                    else {
                        // stop bot
                        this.stopBot(botId);
                        // get previous settings
                        // when changing type of runtime
                        const settings = JSON.parse(yield readFile(path_1.default.resolve(this.getBotDir(botId), 'settings/appsettings.json'), {
                            encoding: 'utf-8',
                        }));
                        if (!((_a = settings.runtime) === null || _a === void 0 ? void 0 : _a.key) || ((_b = settings.runtime) === null || _b === void 0 ? void 0 : _b.key) !== ((_c = project.settings.runtime) === null || _c === void 0 ? void 0 : _c.key)) {
                            // in order to change runtime type
                            yield removeDirAndFiles(this.getBotRuntimeDir(botId));
                            // copy runtime template in folder
                            yield this.copyDir(runtime.path, this.getBotRuntimeDir(botId));
                            yield runtime.build(this.getBotRuntimeDir(botId), project);
                        }
                    }
                }
                catch (error) {
                    // delete the folder to make sure build again.
                    yield removeDirAndFiles(this.getBotDir(botId));
                    throw new Error(error.toString());
                }
            });
            this.saveContent = (botId, version, srcDir, user) => __awaiter(this, void 0, void 0, function* () {
                this.composer.log('Packaging bot assets');
                const dstPath = this.getDownloadPath(botId, version);
                yield this.zipBot(dstPath, srcDir);
            });
            // start bot in current version
            this.setBot = (botId, version, settings, project) => __awaiter(this, void 0, void 0, function* () {
                // get port, and stop previous bot if exist
                try {
                    let port;
                    if (LocalPublisher.runningBots[botId]) {
                        this.composer.log('Bot already running. Stopping bot...');
                        // this may or may not be set based on the status of the bot
                        port = LocalPublisher.runningBots[botId].port;
                        this.stopBot(botId);
                    }
                    if (!port) {
                        port = yield portfinder_1.default.getPortPromise({ port: 3979, stopPort: 5000 });
                    }
                    // if not using custom runtime, update assets in tmp older
                    if (!settings.runtime || settings.runtime.customRuntime !== true) {
                        this.composer.log('Updating bot assets');
                        yield this.restoreBot(botId, version);
                    }
                    else {
                        // if a port (e.g. --port 5000) is configured in the custom runtime command try to parse and set this port
                        if (settings.runtime.command && settings.runtime.command.includes('--port')) {
                            try {
                                port = /--port (\d+)/.exec(settings.runtime.command)[1];
                            }
                            catch (err) {
                                console.warn(`Custom runtime command has an invalid port argument.`);
                            }
                        }
                    }
                    // start the bot process
                    yield this.startBot(botId, port, settings, project);
                }
                catch (error) {
                    console.error('Error in startbot: ', error);
                    this.stopBot(botId);
                    this.setBotStatus(botId, {
                        status: 500,
                        result: {
                            message: error,
                        },
                    });
                }
            });
            this.startBot = (botId, port, settings, project) => __awaiter(this, void 0, void 0, function* () {
                var _d, _e;
                const botDir = ((_d = settings.runtime) === null || _d === void 0 ? void 0 : _d.customRuntime) === true ? settings.runtime.path : this.getBotRuntimeDir(botId);
                const commandAndArgs = ((_e = settings.runtime) === null || _e === void 0 ? void 0 : _e.customRuntime) === true
                    ? settings.runtime.command.split(/\s+/)
                    : this.composer.getRuntimeByProject(project).startCommand.split(/\s+/);
                return new Promise((resolve, reject) => {
                    // ensure the specified runtime path exists
                    if (!fs_1.default.existsSync(botDir)) {
                        reject(`Runtime path ${botDir} does not exist.`);
                        return;
                    }
                    // take the 0th item off the array, leaving just the args
                    this.composer.log('Starting bot on port %d. (%s)', port, commandAndArgs.join(' '));
                    const startCommand = commandAndArgs.shift();
                    let spawnProcess;
                    try {
                        spawnProcess = child_process_1.spawn(startCommand, [...commandAndArgs, '--port', port, `--urls`, `http://0.0.0.0:${port}`, ...this.getConfig(settings)], {
                            cwd: botDir,
                            stdio: ['ignore', 'pipe', 'pipe'],
                            detached: !isWin,
                        });
                        this.composer.log('Started process %d', spawnProcess.pid);
                    }
                    catch (err) {
                        return reject(err);
                    }
                    this.setBotStatus(botId, {
                        process: spawnProcess,
                        port: port,
                        status: 200,
                        result: { message: 'Runtime started' },
                    });
                    const processLog = this.composer.log.extend(spawnProcess.pid);
                    this.addListeners(spawnProcess, botId, processLog);
                    resolve();
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
                if (config.qna.endpointKey) {
                    configList.push('--qna:endpointKey');
                    configList.push(config.qna.endpointKey);
                }
                // console.log(config.qna);
                // console.log(configList);
                return configList;
            };
            this.removeListener = (child) => {
                child.stdout.removeAllListeners('data');
                child.stderr.removeAllListeners('data');
                child.removeAllListeners('message');
                child.removeAllListeners('error');
                child.removeAllListeners('exit');
            };
            this.addListeners = (child, botId, 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            logger) => {
                let erroutput = '';
                child.stdout &&
                    child.stdout.on('data', (data) => {
                        logger('%s', data);
                    });
                child.stderr &&
                    child.stderr.on('data', (err) => {
                        erroutput += err.toString();
                    });
                child.on('exit', (code) => {
                    if (code !== 0) {
                        logger('error on exit: %s, exit code %d', erroutput, code);
                        this.setBotStatus(botId, { status: 500, result: { message: erroutput } });
                    }
                });
                child.on('error', (err) => {
                    logger('error: %s', err.message);
                    this.setBotStatus(botId, { status: 500, result: { message: err.message } });
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
            // make it public, so that able to stop runtime before switch ejected runtime.
            this.stopBot = (botId) => {
                var _a;
                const proc = (_a = LocalPublisher.runningBots[botId]) === null || _a === void 0 ? void 0 : _a.process;
                if (proc) {
                    this.composer.log('Killing process %d', -proc.pid);
                    // Kill the bot process AND all child processes
                    try {
                        this.removeListener(proc);
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