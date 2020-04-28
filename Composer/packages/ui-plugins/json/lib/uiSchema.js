"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var shared_1 = require("@bfc/shared");
var JsonField_1 = require("./JsonField");
var uiSchema = (_a = {},
    _a[shared_1.SDKKinds.HttpRequest] = {
        properties: {
            body: {
                field: JsonField_1.JsonField,
            },
        },
    },
    _a);
exports.default = uiSchema;
//# sourceMappingURL=uiSchema.js.map