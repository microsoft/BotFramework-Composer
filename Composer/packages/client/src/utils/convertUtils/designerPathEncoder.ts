// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';

const ArrayPathPattern = /^(\w+)\[(\d+)\]$/;

const parseArrayPath = (subpath: string) => {
  const matchResults = ArrayPathPattern.exec(subpath);
  if (matchResults?.length !== 3) return null;

  const [_, prefix, indexStr] = matchResults;
  return {
    prefix,
    index: parseInt(indexStr),
  };
};

/**
 * Inputs `triggers[0].actions[0]`, outputs `triggers['12345'].actions['67890']`
 * @param dialog Current active Adaptive dialog json
 * @param path Current focus path in index format
 */
export const encodeArrayPathToDesignerPath = (dialog, path: string): string | null => {
  const subpaths = path.split('.');
  const transformedSubpaths: string[] = [];

  let rootData = dialog;
  for (const p of subpaths) {
    const pathInfo = parseArrayPath(p);
    if (!pathInfo) {
      // For invalid input, fallback to null to avoid silent failure.
      return null;
    }

    const subData = get(rootData, p);
    if (!subData) {
      // For invalid data, fallback to null.
      return null;
    }

    const { prefix, index } = pathInfo;
    // For subdata without designer.id, fallback to array index.
    const designerId: string | number = get(subData, '$designer.id', index);
    const designerIdStr = typeof designerId === 'string' ? `'${designerId}'` : designerId;

    const designerSubpath = `${prefix}[${designerIdStr}]`;
    transformedSubpaths.push(designerSubpath);

    // descent to subData
    rootData = subData;
  }

  const designerPath = transformedSubpaths.join('.');
  return designerPath;
};

const DesignerPathPattern = /^(\w+)\['(\w+)'\]$/;

const parseDesignerPath = (subpath: string) => {
  const matchResults = DesignerPathPattern.exec(subpath);
  if (matchResults?.length !== 3) return null;

  const [_, prefix, designerId] = matchResults;
  return {
    prefix,
    designerId,
  };
};

/**
 * Inputs `triggers['12345'].actions['67890']`, outputs `triggers[0].actions[0]`
 * @param dialog Current active Adaptive dialog json
 * @param path Current focus path in designer format
 */
export const decodeDesignerPathToArrayPath = (dialog, path: string): string | null => {
  const subpaths = path.split('.');
  const transformedSubpaths: string[] = [];

  let rootData = dialog;
  for (const p of subpaths) {
    const pathInfo = parseDesignerPath(p);
    if (!pathInfo) {
      // For invalid input path, fallback to origin designer path
      return path;
    }

    const { prefix: arrayName, designerId } = pathInfo;

    const arrayData = get(rootData, arrayName);
    if (!Array.isArray(arrayData)) {
      // For invalid data, fallback to origin designer path
      return null;
    }

    const arrayIndex = arrayData.findIndex((x) => get(x, '$designer.id') === designerId);
    if (arrayIndex === -1) {
      // Can't find given designer id, fallback to input path.
      return null;
    }

    const arraySubpath = `${arrayName}[${arrayIndex}]`;
    transformedSubpaths.push(arraySubpath);

    // descent to subData
    rootData = arrayData[arrayIndex];
  }

  const indexPath = transformedSubpaths.join('.');
  return indexPath;
};
