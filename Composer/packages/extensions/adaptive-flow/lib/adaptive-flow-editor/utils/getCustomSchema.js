// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SDKKinds } from '@bfc/shared';
import pickBy from 'lodash/pickBy';
var pickSchema = function (picked$kinds, sourceSchema) {
  var _a;
  if (!Array.isArray(picked$kinds) || picked$kinds.length === 0) return undefined;
  var pickedSchema = picked$kinds.reduce(
    function (schema, $kind) {
      var _a;
      var definition = sourceSchema[$kind];
      schema.definitions[$kind] = definition;
      (_a = schema.oneOf) === null || _a === void 0
        ? void 0
        : _a.push({
            title: definition.title || $kind,
            description: definition.description || '',
            $ref: '#/definitions/' + $kind,
          });
      return schema;
    },
    {
      oneOf: [],
      definitions: {},
    }
  );
  // Sort `oneOf` list alphabetically
  (_a = pickedSchema.oneOf) === null || _a === void 0
    ? void 0
    : _a.sort(function (a, b) {
        return a.$ref < b.$ref ? -1 : 1;
      });
  return pickedSchema;
};
var roleImplementsInterface = function (interfaceName, $role) {
  if (typeof $role === 'string') return $role === 'implements(' + interfaceName + ')';
  else if (Array.isArray($role))
    return $role.some(function (x) {
      return x === 'implements(' + interfaceName + ')';
    });
  return false;
};
var isActionSchema = function (schema) {
  return roleImplementsInterface(SDKKinds.IDialog, schema.$role);
};
var isTriggerSchema = function (schema) {
  return roleImplementsInterface(SDKKinds.ITrigger, schema.$role);
};
var isRecognizerSchema = function (schema) {
  return (
    roleImplementsInterface(SDKKinds.IRecognizer, schema.$role) ||
    roleImplementsInterface(SDKKinds.IEntityRecognizer, schema.$role)
  );
};
export var getCustomSchema = function (baseSchema, ejectedSchema) {
  if (!baseSchema || !ejectedSchema) return {};
  if (typeof baseSchema.definitions !== 'object' || typeof ejectedSchema.definitions !== 'object') return {};
  var baseDefinitions = baseSchema.definitions;
  var ejectedDefinitions = ejectedSchema.definitions;
  var baseKindHash = Object.keys(baseDefinitions).reduce(function (hash, $kind) {
    hash[$kind] = true;
    return hash;
  }, {});
  var diffKinds = Object.keys(ejectedDefinitions).filter(function ($kind) {
    return !baseKindHash[$kind];
  });
  if (diffKinds.length === 0) return {};
  // Differentiate 'trigger' / 'recognizer' / 'action'
  var actionKinds = diffKinds.filter(function ($kind) {
    return isActionSchema(ejectedDefinitions[$kind]);
  });
  var triggerKinds = diffKinds.filter(function ($kind) {
    return isTriggerSchema(ejectedDefinitions[$kind]);
  });
  var recognizerKinds = diffKinds.filter(function ($kind) {
    return isRecognizerSchema(ejectedDefinitions[$kind]);
  });
  return pickBy(
    {
      actions: pickSchema(actionKinds, ejectedDefinitions),
      triggers: pickSchema(triggerKinds, ejectedDefinitions),
      recognizers: pickSchema(recognizerKinds, ejectedDefinitions),
    },
    function (v) {
      return v !== undefined;
    }
  );
};
//# sourceMappingURL=getCustomSchema.js.map
