'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ExtensionContext = void 0;
var tslib_1 = require('tslib');
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var components_1 = require('./components');
var extensionContext_1 = tslib_1.__importDefault(require('./extensionContext'));
tslib_1.__exportStar(require('./components'), exports);
tslib_1.__exportStar(require('./hooks'), exports);
tslib_1.__exportStar(require('./types'), exports);
tslib_1.__exportStar(require('./utils'), exports);
exports.default = components_1.Extension;
exports.ExtensionContext = extensionContext_1.default;
//# sourceMappingURL=index.js.map
