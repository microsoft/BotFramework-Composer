// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import uniq from 'lodash/uniq';

import { PropertyItem } from '../types';

/**
 * Converts the list pf properties to a tree and returns the root.
 * @param properties List of available properties.
 */
export const computePropertyItemTree = (properties: readonly string[]): PropertyItem => {
  // Generate random unique ids
  const generateId = () => {
    const arr = crypto.getRandomValues(new Uint32Array(1));
    return `${arr[0]}`;
  };

  const items = properties.slice().sort();
  const dummyRoot = { id: 'root', name: 'root', children: [] };

  const helper = (currentNode: PropertyItem, prefix: string, scopedItems: string[], level: number) => {
    const uniques = uniq(scopedItems.map((i) => i.split('.')[level])).filter(Boolean);
    const children = uniques.map((name) => ({ id: generateId(), name, children: [] }));
    for (const n of children) {
      helper(
        n,
        `${prefix}${prefix ? '.' : ''}${n.name}`,
        items.filter((i) => i.startsWith(`${prefix}${prefix ? '.' : ''}${n.name}`)),
        level + 1
      );
    }
    currentNode.children = children;
  };

  helper(dummyRoot, '', items, 0);

  return dummyRoot;
};

const getPath = <T extends { id: string; name: string; children?: T[] }>(item: T, parents: Record<string, T>) => {
  const path: string[] = [];
  let currentItem = item;
  if (currentItem) {
    while (currentItem) {
      path.push(currentItem.name);
      currentItem = parents[currentItem.id];
      while (currentItem && currentItem.id.indexOf('root') !== -1) {
        currentItem = parents[currentItem.id];
      }
    }
  }
  return path.reverse().join('.');
};

/**
 * Returns a flat list of nodes, their level by id, and the path from root to that node.
 * @param root Root of the tree.
 * @param options Options including current state of expanded nodes, and if the root should be skipped.
 */
export const getAllNodes = <T extends { id: string; name: string; children?: T[] }>(
  root: T,
  options?: Partial<{ expanded: Record<string, boolean>; skipRoot: boolean }>
): {
  nodes: T[];
  levels: Record<string, number>;
  paths: Record<string, string>;
} => {
  const nodes: T[] = [];
  const levels: Record<string, number> = {};
  const parents: Record<string, T> = {};
  const paths: Record<string, string> = {};

  if (options?.skipRoot && options?.expanded) {
    options.expanded[root.id] = true;
  }

  const addNode = (node: T, parent: T | null, level = 0) => {
    if (!options?.skipRoot || node.id !== root.id) {
      nodes.push(node);
    }
    levels[node.id] = level;
    if (parent) {
      parents[node.id] = parent;
    }
    paths[node.id] = getPath(node, parents);
    if (options?.expanded) {
      if (!options.expanded[node.id]) {
        return;
      }
    }
    if (node?.children?.length) {
      node.children.forEach((n) => addNode(n, node, level + 1));
    }
  };

  addNode(root, null);

  return { nodes, levels, paths };
};
