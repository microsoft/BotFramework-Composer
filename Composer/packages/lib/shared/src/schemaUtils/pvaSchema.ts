// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const checkSchemaFor = (schema, definition) => {
  if (schema?.content?.definitions) {
    return schema.content.definitions[definition] !== undefined;
  }
  return false;
};

export const checkForPVASchema = (schema) => checkSchemaFor(schema, 'Microsoft.VirtualAgents.Recognizer');

export const checkForOrchestratorSchema = (schema) => checkSchemaFor(schema, 'Microsoft.OrchestratorRecognizer');
