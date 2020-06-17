// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export var getCustomSchema = function (baseSchema, ejectedSchema) {
  if (!baseSchema || !ejectedSchema) return;
  if (typeof baseSchema.definitions !== 'object' || typeof ejectedSchema.definitions !== 'object') return;
  var baseDefinitions = baseSchema.definitions;
  var baseKindHash = Object.keys(baseDefinitions).reduce(function (hash, $kind) {
    hash[$kind] = true;
    return hash;
  }, {});
  var ejectedDefinitions = ejectedSchema.definitions;
  var diffKinds = Object.keys(ejectedDefinitions).filter(function ($kind) {
    return !baseKindHash[$kind];
  });
  if (diffKinds.length === 0) return;
  var diffSchema = diffKinds.reduce(
    function (schema, $kind) {
      var _a;
      var definition = ejectedDefinitions[$kind];
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
  return diffSchema;
};
//# sourceMappingURL=getCustomSchema.js.map
