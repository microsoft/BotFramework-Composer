// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const checkForPVASchema = (schema) => {
  if (schema && schema.content && schema.content.definitions) {
    return schema.content.definitions['Microsoft.VirtualAgents.Recognizer'] !== undefined;
  }
  return false;
};
