"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Extension = void 0;
var tslib_1 = require("tslib");
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var react_1 = tslib_1.__importStar(require("react"));
var extensionContext_1 = tslib_1.__importDefault(require("../extensionContext"));
exports.Extension = function (_a) {
    var shell = _a.shell, plugins = _a.plugins, children = _a.children;
    var context = react_1.useMemo(function () {
        return { shellApi: shell.api, shellData: shell.data, plugins: plugins };
    }, [shell.api, shell.data, plugins]);
    return react_1.default.createElement(extensionContext_1.default.Provider, { value: context }, children);
};
exports.default = exports.Extension;
//# sourceMappingURL=Extension.js.map