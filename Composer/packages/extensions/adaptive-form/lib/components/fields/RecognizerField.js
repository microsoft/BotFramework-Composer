"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecognizerField = void 0;
var tslib_1 = require("tslib");
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
var core_1 = require("@emotion/core");
var react_1 = tslib_1.__importStar(require("react"));
var extension_1 = require("@bfc/extension");
var shared_1 = require("@bfc/shared");
var Dropdown_1 = require("office-ui-fabric-react/lib/Dropdown");
var format_message_1 = tslib_1.__importDefault(require("format-message"));
var code_editor_1 = require("@bfc/code-editor");
var FieldLabel_1 = require("../FieldLabel");
var RecognizerField = function (props) {
    var value = props.value, id = props.id, label = props.label, description = props.description, uiOptions = props.uiOptions, required = props.required, onChange = props.onChange;
    var _a = extension_1.useShellApi(), shellApi = _a.shellApi, shellData = tslib_1.__rest(_a, ["shellApi"]);
    var recognizers = extension_1.useRecognizerConfig();
    var qnaFiles = shellData.qnaFiles, luFiles = shellData.luFiles, currentDialog = shellData.currentDialog, locale = shellData.locale;
    var _b = react_1.useState(false), isCustomType = _b[0], setIsCustomType = _b[1];
    react_1.useEffect(function () {
        // this logic is for handling old bot with `recognizer = undefined'
        if (value === undefined) {
            var qnaFile = qnaFiles.find(function (f) { return f.id === currentDialog.id + "." + locale; });
            var luFile = luFiles.find(function (f) { return f.id === currentDialog.id + "." + locale; });
            if (qnaFile && luFile) {
                onChange(currentDialog.id + ".lu.qna");
            }
        }
        // transform lu recognizer to crosstrained for old bot
        if (value === currentDialog.id + ".lu") {
            onChange(currentDialog.id + ".lu.qna");
        }
    }, [value]);
    var options = react_1.useMemo(function () {
        // filter luisRecognizer for dropdown options
        return recognizers
            .filter(function (r) { return r.id !== shared_1.SDKKinds.LuisRecognizer; })
            .map(function (r) { return ({
            key: r.id,
            text: typeof r.displayName === 'function' ? r.displayName(value) : r.displayName,
        }); });
    }, [recognizers]);
    var selectedType = react_1.useMemo(function () {
        if (isCustomType) {
            return shared_1.SDKKinds.CustomRecognizer;
        }
        var selected = value === undefined
            ? recognizers.length > 0
                ? [recognizers[0].id]
                : []
            : recognizers.filter(function (r) { return r.isSelected(value); }).map(function (r) { return r.id; });
        var involvedCustomItem = selected.find(function (item) { return item !== shared_1.SDKKinds.CustomRecognizer; });
        if (involvedCustomItem) {
            return involvedCustomItem;
        }
        if (selected.length < 1) {
            /* istanbul ignore next */
            if (process.env.NODE_ENV === 'development') {
                console.error("Unable to determine selected recognizer.\n\n         Value: " + JSON.stringify(value) + ".\n\n         Selected Recognizers: [" + selected.join(', ') + "]");
            }
            return;
        }
        // transform luis recognizer to crosss trained recognizer for old bot.
        if (selected[0] === shared_1.SDKKinds.LuisRecognizer) {
            selected[0] = shared_1.SDKKinds.CrossTrainedRecognizerSet;
        }
        return selected[0];
    }, [value, isCustomType]);
    var handleChangeRecognizerType = function (_, option) {
        var _a;
        if (option) {
            if (option.key === shared_1.SDKKinds.CustomRecognizer) {
                setIsCustomType(true);
                return;
            }
            setIsCustomType(false);
            var handler = (_a = recognizers.find(function (r) { return r.id === option.key; })) === null || _a === void 0 ? void 0 : _a.handleRecognizerChange;
            if (handler) {
                handler(props, shellData, shellApi);
            }
        }
    };
    var handleCustomChange = function (value) {
        setIsCustomType(true);
        onChange(value);
    };
    return (core_1.jsx(react_1.default.Fragment, null,
        core_1.jsx(FieldLabel_1.FieldLabel, { description: description, helpLink: uiOptions === null || uiOptions === void 0 ? void 0 : uiOptions.helpLink, id: id, label: label, required: required }),
        selectedType ? (core_1.jsx(Dropdown_1.Dropdown, { "data-testid": "recognizerTypeDropdown", label: format_message_1.default('Recognizer Type'), options: options, responsiveMode: Dropdown_1.ResponsiveMode.large, selectedKey: selectedType, onChange: handleChangeRecognizerType })) : (format_message_1.default('Unable to determine recognizer type from data: {value}', { value: value })),
        selectedType === shared_1.SDKKinds.CustomRecognizer && (core_1.jsx(code_editor_1.JsonEditor, { key: 'customRecognizer', height: 200, id: 'customRecog', value: value, onChange: handleCustomChange }))));
};
exports.RecognizerField = RecognizerField;
//# sourceMappingURL=RecognizerField.js.map