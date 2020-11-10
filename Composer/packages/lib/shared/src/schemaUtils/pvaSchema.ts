// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const checkForPVASchema = (schema) => {
  return schema.content.definitions['Microsoft.VirtualAgents.Recognizer'] !== undefined;
};
