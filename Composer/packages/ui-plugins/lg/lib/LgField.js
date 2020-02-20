"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var code_editor_1 = require("@bfc/code-editor");
var extension_1 = require("@bfc/extension");
var adaptive_form_1 = require("@bfc/adaptive-form");
var shared_1 = require("@bfc/shared");
var indexers_1 = require("@bfc/indexers");
var debounce_1 = __importDefault(require("lodash/debounce"));
var isEqual_1 = __importDefault(require("lodash/isEqual"));
var lspServerPath = '/lg-language-server';
var tryGetLgMetaDataType = function (lgText) {
    var lgRef = shared_1.LgTemplateRef.parse(lgText);
    if (lgRef === null)
        return null;
    var lgMetaData = shared_1.LgMetaData.parse(lgRef.name);
    if (lgMetaData === null)
        return null;
    return lgMetaData.type;
};
var getInitialTemplate = function (fieldName, formData) {
    var lgText = formData || '';
    // Field content is already a ref created by composer.
    if (tryGetLgMetaDataType(lgText) === fieldName) {
        return '';
    }
    return lgText.startsWith('-') ? lgText : "- " + lgText;
};
var LgField = function (props) {
    var label = props.label, id = props.id, description = props.description, value = props.value;
    var _a = extension_1.useShellApi(), dialogId = _a.dialogId, currentDialog = _a.currentDialog, lgFiles = _a.lgFiles, shellApi = _a.shellApi;
    var singleLgRefMatched = value && value.match("@\\{([A-Za-z_][-\\w]+)(\\([^\\)]*\\))?\\}");
    var lgName = singleLgRefMatched ? singleLgRefMatched[1] : new shared_1.LgMetaData(name, dialogId || '').toString();
    var lgFileId = currentDialog.lgFile || 'common';
    var lgFile = lgFiles && lgFiles.find(function (file) { return file.id === lgFileId; });
    var updateLgTemplate = react_1.useCallback(function (body) {
        shellApi.updateLgTemplate(lgFileId, lgName, body).catch(function () { });
    }, [lgName, lgFileId]);
    var template = (lgFile &&
        lgFile.templates &&
        lgFile.templates.find(function (template) {
            return template.name === lgName;
        })) || {
        name: lgName,
        parameters: [],
        body: getInitialTemplate(name, value),
        range: {
            startLineNumber: 0,
            endLineNumber: 2,
        },
    };
    var diagnostic = lgFile && indexers_1.filterTemplateDiagnostics(lgFile.diagnostics, template)[0];
    var errorMsg = diagnostic
        ? diagnostic.message.split('error message: ')[diagnostic.message.split('error message: ').length - 1]
        : '';
    var _b = react_1.useState(template.body), localValue = _b[0], setLocalValue = _b[1];
    var sync = react_1.useRef(debounce_1.default(function (shellData, localData) {
        if (!isEqual_1.default(shellData, localData)) {
            setLocalValue(shellData);
        }
    }, 750)).current;
    react_1.useEffect(function () {
        sync(template.body, localValue);
        return function () {
            sync.cancel();
        };
    }, [template.body]);
    var lgOption = {
        fileId: lgFileId,
        templateId: lgName,
    };
    var onChange = function (body) {
        setLocalValue(body);
        if (dialogId) {
            if (body) {
                updateLgTemplate(body);
                props.onChange(new shared_1.LgTemplateRef(lgName).toString());
            }
            else {
                shellApi.removeLgTemplate(lgFileId, lgName);
                props.onChange();
            }
        }
    };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(adaptive_form_1.FieldLabel, { id: id, label: label, description: description }),
        react_1.default.createElement(code_editor_1.LgEditor, { height: 125, value: localValue, onChange: onChange, errorMessage: errorMsg, hidePlaceholder: true, languageServer: {
                path: lspServerPath,
            }, lgOption: lgOption })));
};
exports.LgField = LgField;
//# sourceMappingURL=LgField.js.map