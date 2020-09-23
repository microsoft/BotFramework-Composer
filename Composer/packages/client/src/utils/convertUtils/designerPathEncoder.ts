// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Inputs `triggers[0].actions[0]`, outputs `triggers['12345'].actions['67890']`
 * @param data Current active Adaptive dialog json
 * @param path Current focus path in index format
 */
export const encodePathToDesignerPath = (data, path: string): string => {
  return path;
};

/**
 * Inputs `triggers['12345'].actions['67890']`, outputs `triggers[0].actions[0]`
 * @param data Current active Adaptive dialog json
 * @param path Current focus path in designer format
 */
export const decodeDesignerPathToPath = (data, designerPath: string): string => {
  return designerPath;
};
