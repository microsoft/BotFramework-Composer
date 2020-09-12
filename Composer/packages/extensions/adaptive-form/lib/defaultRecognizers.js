"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var shared_1 = require("@bfc/shared");
var format_message_1 = tslib_1.__importDefault(require("format-message"));
var RegexIntentField_1 = require("./components/fields/RegexIntentField");
var DefaultRecognizers = [
    {
        id: shared_1.SDKKinds.RegexRecognizer,
        displayName: function () { return format_message_1.default('Regular Expression'); },
        editor: RegexIntentField_1.RegexIntentField,
        isSelected: function (data) {
            return typeof data === 'object' && data.$kind === shared_1.SDKKinds.RegexRecognizer;
        },
        handleRecognizerChange: function (props) {
            props.onChange({ $kind: shared_1.SDKKinds.RegexRecognizer, intents: [] });
        },
        renameIntent: function (intentName, newIntentName, shellData, shellApi) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var currentDialog;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentDialog = shellData.currentDialog;
                        return [4 /*yield*/, shellApi.renameRegExIntent(currentDialog.id, intentName, newIntentName)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
    },
    {
        id: shared_1.SDKKinds.CustomRecognizer,
        displayName: function () { return format_message_1.default('Custom recognizer'); },
        isSelected: function (data) { return typeof data === 'object'; },
        handleRecognizerChange: function (props) {
            return props.onChange({
                $kind: 'Microsoft.MultiLanguageRecognizer',
                recognizers: {
                    'en-us': {
                        $kind: 'Microsoft.RegexRecognizer',
                        intents: [
                            {
                                intent: 'greeting',
                                pattern: 'hello',
                            },
                            {
                                intent: 'test',
                                pattern: 'test',
                            },
                        ],
                    },
                    'zh-cn': {
                        $kind: 'Microsoft.RegexRecognizer',
                        intents: [
                            {
                                intent: 'greeting',
                                pattern: '你好',
                            },
                            {
                                intent: 'test',
                                pattern: '测试',
                            },
                        ],
                    },
                },
            });
        },
        renameIntent: function () { },
    },
];
exports.default = DefaultRecognizers;
//# sourceMappingURL=defaultRecognizers.js.map