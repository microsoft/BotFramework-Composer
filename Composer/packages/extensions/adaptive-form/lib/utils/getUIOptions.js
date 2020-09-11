"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUIOptions = void 0;
/**
 * Merges overrides and plugins into default ui schema and returns the UIOptions
 */
function getUIOptions(schema, uiSchema) {
    var $kind = ((schema === null || schema === void 0 ? void 0 : schema.properties) || {}).$kind;
    var kind = $kind && typeof $kind === 'object' && $kind.const;
    var formOptions = uiSchema && kind && uiSchema[kind] ? uiSchema[kind] : {};
    return formOptions;
}
exports.getUIOptions = getUIOptions;
//# sourceMappingURL=getUIOptions.js.map