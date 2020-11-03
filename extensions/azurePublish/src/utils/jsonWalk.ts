// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * visitor function used by JsonWalk
 * @param path jsonPath string
 * @param value current node value
 * @return boolean, true to stop walk deep
 */
export interface VisitorFunc {
  (path: string, value: any): boolean;
}

/**
 *
 * @param path jsonPath string
 * @param value current node value
 * @param visitor
 */

export const JsonWalk = (path: string, value: any, visitor: VisitorFunc) => {
  const stop = visitor(path, value);
  if (stop === true) return;

  // extract array
  if (Array.isArray(value)) {
    value.forEach((child, index) => {
      JsonWalk(`${path}[${index}]`, child, visitor);
    });

    // extract object
  } else if (typeof value === 'object' && value) {
    Object.keys(value).forEach((key) => {
      JsonWalk(`${path}.${key}`, value[key], visitor);
    });
  }
};
