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
const archiver_1 = __importDefault(require("archiver"));
const uuid_1 = require("uuid");
const get_port_1 = __importDefault(require("get-port"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const stat = util_1.promisify(fs_1.default.stat);
const readFile = util_1.promisify(fs_1.default.readFile);
const readDir = util_1.promisify(fs_1.default.readdir);
const writeFile = util_1.promisify(fs_1.default.writeFile);
const removeFile = util_1.promisify(fs_1.default.unlink);
const mkDir = util_1.promisify(fs_1.default.mkdir);
const rmDir = util_1.promisify(fs_1.default.rmdir);
const copyFile = util_1.promisify(fs_1.default.copyFile);
const rename = util_1.promisify(fs_1.default.rename);
class LocalPublisher {
    constructor() {
        this.baseDir = './';
        this.templatePath = path_1.default.resolve(this.baseDir, 'template', 'CSharp');
        // config include botId and version, project is content(ComposerDialogs)
        this.publish = (config, project, user) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('PUBLISH ', config, project);
                const { botId, version } = config;
                yield this.initBot(botId);
                this.saveContent(config, project, user);
                const url = this.setBot(botId, version, project);
                return {
                    status: 200,
                    result: {
                        jobId: new uuid_1.v4(),
                        version: version,
                    },
                };
            }
            catch (error) {
                console.error(error);
                return {
                    status: 500,
                    message: error.message,
                };
            }
        });
        this.getStatus = (config) => __awaiter(this, void 0, void 0, function* () { });
        this.history = (config) => __awaiter(this, void 0, void 0, function* () { });
        this.rollback = (config, versionId) => __awaiter(this, void 0, void 0, function* () { });
        this.getBotsDir = () => path_1.default.resolve(this.baseDir, 'hostedBots');
        this.getBotDir = (botId) => path_1.default.resolve(this.getBotsDir(), botId);
        this.getBotAssetsDir = (botId) => path_1.default.resolve(this.getBotDir(botId), 'ComposerDialogs');
        this.getHistoryDir = (botId) => path_1.default.resolve(this.getBotDir(botId), 'history');
        this.getDownloadPath = (botId, version) => path_1.default.resolve(this.getHistoryDir(botId), `${version}.zip`);
        this.botExist = (botId) => __awaiter(this, void 0, void 0, function* () {
            const status = yield stat(this.getBotDir(botId));
            return status.isDirectory();
        });
        this.initBot = (botId) => __awaiter(this, void 0, void 0, function* () {
            if (!this.botExist(botId)) {
                const botDir = this.getBotDir(botId);
                // create bot dir
                yield mkDir(botDir);
                // copy runtime template in folder
                yield this.copyDir(this.templatePath, botDir);
                // create ComposerDialogs and histroy folder
                mkDir(this.getBotAssetsDir(botId));
                mkDir(this.getHistoryDir(botId));
                child_process_1.execSync('dotnet user-secrets init', { cwd: botDir });
                child_process_1.execSync('dotnet build', { cwd: botDir });
            }
        });
        this.saveContent = (config, project, user) => __awaiter(this, void 0, void 0, function* () {
            const dstPath = this.getDownloadPath(config.botId, config.version);
            yield this.zipBot(dstPath, project);
        });
        // start bot in current version
        this.setBot = (botId, version, project = undefined) => __awaiter(this, void 0, void 0, function* () {
            // get port, and stop previous bot if exist
            let port;
            if (LocalPublisher.runningBots[botId]) {
                port = LocalPublisher.runningBots[botId].port;
                this.stopBot(botId);
            }
            else {
                port = yield get_port_1.default({ host: 'localhost', port: parseInt('3979') });
            }
            yield this.restoreBot(botId, version);
            try {
                yield this.startBot(botId, port);
            }
            catch (error) {
                this.stopBot(botId);
            }
        });
        this.startBot = (botId, port) => __awaiter(this, void 0, void 0, function* () {
            const botDir = this.getBotDir(botId);
            return new Promise((resolve, reject) => {
                const process = child_process_1.spawn('dotnet', ['bin/Debug/netcoreapp3.1/BotProject.dll', `--urls`, `http://localhost:${port}`], {
                    cwd: botDir,
                    stdio: ['ignore', 'pipe', 'pipe'],
                });
                LocalPublisher.runningBots[botId] = { process: process, port: port };
                this.addListeners(process, resolve, reject);
            });
        });
        this.addListeners = (child, resolve, reject) => {
            let erroutput = '';
            child.stdout &&
                child.stdout.on('data', (data) => {
                    resolve(child.pid);
                });
            child.stderr &&
                child.stderr.on('data', (err) => {
                    erroutput += err.toString();
                });
            child.on('exit', code => {
                if (code !== 0) {
                    reject(erroutput);
                }
            });
            child.on('message', msg => {
                console.log(msg);
            });
        };
        this.restoreBot = (botId, version) => __awaiter(this, void 0, void 0, function* () {
            const dstPath = this.getDownloadPath(botId, version);
            yield this.unZipBot(dstPath);
        });
        this.zipBot = (dstPath, project) => __awaiter(this, void 0, void 0, function* () {
            // delete previous and create new
            if ((yield stat(dstPath)).isFile) {
                yield removeFile(dstPath);
            }
            return new Promise((resolve, reject) => {
                const archive = archiver_1.default('zip');
                const output = fs_1.default.createWriteStream(dstPath);
                archive.pipe(output);
                for (const f in project) {
                    const file = project[f];
                    // trim the beginning "ComposerDialogs"
                    const name = file.relativePath.startsWith('ComposerDialogs')
                        ? file.relativePath.substring(16)
                        : file.relativePath;
                    archive.append(file.content, { name: name });
                }
                archive.finalize();
                output.on('close', () => resolve(dstPath));
                output.on('error', err => reject(err));
            });
        });
        this.unZipBot = (dstPath) => __awaiter(this, void 0, void 0, function* () {
            if (!(yield stat(dstPath)).isFile) {
                throw new Error('no such version bot');
            }
            const zip = new adm_zip_1.default(dstPath);
            zip.extractAllTo(this.getBotAssetsDir, true);
        });
        this.stopBot = (botId) => {
            var _a;
            (_a = LocalPublisher.runningBots[botId]) === null || _a === void 0 ? void 0 : _a.process.kill('SIGKILL');
            delete LocalPublisher.runningBots[botId];
        };
        this.copyDir = (srcDir, dstDir) => __awaiter(this, void 0, void 0, function* () {
            if (!(yield stat(srcDir)).isDirectory) {
                throw new Error(`no such dir ${srcDir}`);
            }
            if (!(yield stat(dstDir)).isDirectory) {
                yield mkDir(dstDir, { recursive: true });
            }
            const paths = yield readDir(srcDir);
            for (const path of paths) {
                const srcPath = `${srcDir}/${path}`;
                const dstPath = `${dstDir}/${path}`;
                if ((yield stat(srcPath)).isFile) {
                    // copy files
                    yield copyFile(srcPath, dstPath);
                }
                else {
                    // recursively copy dirs
                    yield this.copyDir(srcPath, dstPath);
                }
            }
        });
    }
}
LocalPublisher.runningBots = {};
LocalPublisher.stopAll = () => {
    for (const botId in LocalPublisher.runningBots) {
        const bot = LocalPublisher.runningBots[botId];
        bot.process.kill('SIGKILL');
        delete LocalPublisher.runningBots[botId];
    }
};
const publisher = new LocalPublisher();
exports.default = (composer) => __awaiter(void 0, void 0, void 0, function* () {
    // pass in the custom storage class that will override the default
    yield composer.addPublishMethod(publisher);
});
//# sourceMappingURL=index.js.map