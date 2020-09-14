"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const passport_1 = tslib_1.__importDefault(require("passport"));
const path_to_regexp_1 = require("path-to-regexp");
const globby_1 = tslib_1.__importDefault(require("globby"));
const format_message_1 = tslib_1.__importDefault(require("format-message"));
const types_1 = require("../types/types");
const logger_1 = tslib_1.__importDefault(require("../logger"));
const composerPluginRegistration_1 = require("./composerPluginRegistration");
class PluginLoader {
    constructor() {
        this.loginUri = '/login';
        this.extensions = {
            storage: {},
            publish: {},
            authentication: {
                allowedUrls: [this.loginUri],
            },
            runtimeTemplates: [],
            botTemplates: [],
            baseTemplates: [],
        };
        this._passport = passport_1.default;
    }
    get passport() {
        return this._passport;
    }
    get webserver() {
        return this._webserver;
    }
    // allow webserver to be set programmatically
    useExpress(webserver) {
        this._webserver = webserver;
        this._webserver.use((req, res, next) => {
            // if an auth middleware exists...
            if (this.extensions.authentication.middleware) {
                // and the url is not in the allowed urls array
                if (this.extensions.authentication.allowedUrls.filter((pattern) => {
                    const regexp = path_to_regexp_1.pathToRegexp(pattern);
                    return req.url.match(regexp);
                }).length === 0) {
                    // hand off to the plugin-specified middleware
                    return this.extensions.authentication.middleware(req, res, next);
                }
            }
            next();
        });
    }
    loadPlugin(name, description, thisPlugin) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const pluginRegistration = new composerPluginRegistration_1.ComposerPluginRegistration(this, name, description);
            if (typeof thisPlugin.default === 'function') {
                // the module exported just an init function
                thisPlugin.default.call(null, pluginRegistration);
            }
            else if (thisPlugin.default && thisPlugin.default.initialize) {
                // the module exported an object with an initialize method
                thisPlugin.default.initialize.call(null, pluginRegistration);
            }
            else if (thisPlugin.initialize && typeof thisPlugin.initialize === 'function') {
                // the module exported an object with an initialize method
                thisPlugin.initialize.call(null, pluginRegistration);
            }
            else {
                throw new Error(format_message_1.default('Could not init plugin'));
            }
        });
    }
    loadPluginFromFile(path) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const packageJSON = fs_1.default.readFileSync(path, 'utf8');
            const json = JSON.parse(packageJSON);
            if (json.extendsComposer) {
                const modulePath = path.replace(/package\.json$/, '');
                try {
                    // eslint-disable-next-line security/detect-non-literal-require, @typescript-eslint/no-var-requires
                    const thisPlugin = require(modulePath);
                    this.loadPlugin(json.name, json.description, thisPlugin);
                }
                catch (err) {
                    logger_1.default('Error:', err === null || err === void 0 ? void 0 : err.message);
                }
            }
            else {
                // noop - this is not a composer plugin
            }
        });
    }
    loadPluginsFromFolder(dir) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const plugins = yield globby_1.default('*/package.json', { cwd: dir, dot: true });
            for (const p in plugins) {
                yield this.loadPluginFromFile(path_1.default.join(dir, plugins[p]));
            }
        });
    }
    // get the runtime template currently used from project
    getRuntimeByProject(project) {
        var _a;
        const type = ((_a = project.settings.runtime) === null || _a === void 0 ? void 0 : _a.key) || types_1.DEFAULT_RUNTIME;
        const template = this.extensions.runtimeTemplates.find((t) => t.key === type);
        if (template) {
            return template;
        }
        else {
            throw new Error(format_message_1.default(`Support for runtime with name ${type} not available`));
        }
    }
    // get the runtime template currently used by type
    getRuntime(type) {
        if (!type) {
            type = types_1.DEFAULT_RUNTIME;
        }
        const template = this.extensions.runtimeTemplates.find((t) => t.key === type);
        if (template) {
            return template;
        }
        else {
            throw new Error(format_message_1.default(`Support for runtime type ${type} not available`));
        }
    }
    static getUserFromRequest(req) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return req.user || undefined;
        });
    }
}
exports.PluginLoader = PluginLoader;
exports.pluginLoader = new PluginLoader();
exports.default = exports.pluginLoader;
//# sourceMappingURL=pluginLoader.js.map