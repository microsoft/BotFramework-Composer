"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegexIntentField = void 0;
var tslib_1 = require("tslib");
/** @jsx jsx */
var core_1 = require("@emotion/core");
var react_1 = require("react");
var extension_1 = require("@bfc/extension");
var StringField_1 = require("./StringField");
function getRegexIntentPattern(currentDialog, intent) {
    var _a;
    var recognizer = currentDialog.content.recognizer;
    var pattern = '';
    if (!recognizer) {
        return '';
    }
    if (recognizer.intents) {
        pattern = ((_a = recognizer.intents.find(function (i) { return i.intent === intent; })) === null || _a === void 0 ? void 0 : _a.pattern) || '';
    }
    return pattern;
}
var RegexIntentField = function (_a) {
    var _b;
    var intentName = _a.value, rest = tslib_1.__rest(_a, ["value"]);
    var _c = extension_1.useShellApi(), currentDialog = _c.currentDialog, shellApi = _c.shellApi;
    var _d = react_1.useState(getRegexIntentPattern(currentDialog, intentName)), localValue = _d[0], setLocalValue = _d[1];
    // if the intent name changes or intent names in the regex patterns
    // we need to reset the local value
    react_1.useEffect(function () {
        var pattern = getRegexIntentPattern(currentDialog, intentName);
        setLocalValue(pattern);
    }, [intentName, (_b = currentDialog.content.recognizer) === null || _b === void 0 ? void 0 : _b.intents.map(function (i) { return i.intent; })]);
    var handleIntentChange = function (pattern) {
        setLocalValue(pattern !== null && pattern !== void 0 ? pattern : '');
        shellApi.updateRegExIntent(currentDialog.id, intentName, pattern !== null && pattern !== void 0 ? pattern : '');
    };
    return core_1.jsx(StringField_1.StringField, tslib_1.__assign({}, rest, { label: false, value: localValue, onChange: handleIntentChange }));
};
exports.RegexIntentField = RegexIntentField;
//# sourceMappingURL=RegexIntentField.js.map