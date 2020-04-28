"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var shared_1 = require("@bfc/shared");
var EventNameField_1 = require("./EventNameField");
var config = {
    formSchema: (_a = {},
        _a[shared_1.SDKKinds.EmitEvent] = {
            properties: {
                eventName: {
                    field: EventNameField_1.EventNameField,
                },
            },
        },
        _a),
};
exports.default = config;
//# sourceMappingURL=index.js.map