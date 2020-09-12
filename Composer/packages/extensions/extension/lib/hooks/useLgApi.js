"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLgApi = void 0;
var tslib_1 = require("tslib");
var shared_1 = require("@bfc/shared");
/**
 * LG CRUD lib
 */
exports.useLgApi = function (shellApi) {
    var removeLgTemplates = shellApi.removeLgTemplates, getLgTemplates = shellApi.getLgTemplates, addLgTemplate = shellApi.addLgTemplate;
    var deleteLgTemplates = function (lgFileId, lgTemplates) {
        var normalizedLgTemplates = lgTemplates
            .map(function (x) {
            var lgTemplateRef = shared_1.LgTemplateRef.parse(x);
            return lgTemplateRef ? lgTemplateRef.name : '';
        })
            .filter(function (x) { return !!x; });
        return removeLgTemplates(lgFileId, normalizedLgTemplates);
    };
    var readLgTemplate = function (lgFileId, lgText) {
        if (!lgText)
            return '';
        var inputLgRef = shared_1.LgTemplateRef.parse(lgText);
        if (!inputLgRef)
            return lgText;
        var lgTemplates = getLgTemplates(inputLgRef.name);
        if (!Array.isArray(lgTemplates) || !lgTemplates.length)
            return lgText;
        var targetTemplate = lgTemplates.find(function (x) { return x.name === inputLgRef.name; });
        return targetTemplate ? targetTemplate.body : lgText;
    };
    var createLgTemplate = function (lgFileId, lgText, hostActionId, hostActionData, hostFieldName) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var newLgType, newLgTemplateName, newLgTemplateRefStr;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!lgText)
                        return [2 /*return*/, ''];
                    newLgType = new shared_1.LgType(hostActionData.$kind, hostFieldName).toString();
                    newLgTemplateName = new shared_1.LgMetaData(newLgType, hostActionId).toString();
                    newLgTemplateRefStr = new shared_1.LgTemplateRef(newLgTemplateName).toString();
                    return [4 /*yield*/, addLgTemplate(lgFileId, newLgTemplateName, lgText)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, newLgTemplateRefStr];
            }
        });
    }); };
    return {
        createLgTemplate: createLgTemplate,
        readLgTemplate: readLgTemplate,
        deleteLgTemplate: function (lgFileId, lgTemplate) { return deleteLgTemplates(lgFileId, [lgTemplate]); },
        deleteLgTemplates: deleteLgTemplates,
    };
};
//# sourceMappingURL=useLgApi.js.map