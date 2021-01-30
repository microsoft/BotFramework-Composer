// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import uniq from 'lodash/uniq';

import { LgLanguageContext, PropertyItem } from './types';

const templateStart = '- ';
const templateStartRegex = /\s*-\s*.*$/;

/**
 * This function returns the context of the current cursor position in an LG document.
 * @param editor LG editor instance.
 */
const getCursorContext = (editor: any) => {
  const state: LgLanguageContext[] = [];
  const position = editor.getPosition() ?? { lineNumber: 1, column: 1 };
  const range = {
    startLineNumber: position.lineNumber,
    startColumn: 1,
    endLineNumber: position.lineNumber,
    endColumn: position.column,
  };
  let lineContent = editor.getModel()?.getValueInRange(range) ?? '';

  if (!lineContent.startsWith('-')) {
    lineContent = `- ${lineContent}`;
  }

  state.push('root');

  if (lineContent.trim().startsWith('#')) {
    return 'templateName';
  } else if (lineContent.trim().startsWith('>')) {
    return 'comment';
  } else if (lineContent.trim().startsWith('-')) {
    state.push('templateBody');
  } else {
    return 'root';
  }

  let i = 0;
  while (i < lineContent.length) {
    const char = lineContent.charAt(i);
    if (char === `'`) {
      if (state[state.length - 1] === 'expression' || state[state.length - 1] === 'doubleQuote') {
        state.push('singleQuote');
      } else {
        state.pop();
      }
    }

    if (char === `"`) {
      if (state[state.length - 1] === 'expression' || state[state.length - 1] === 'singleQuote') {
        state.push('doubleQuote');
      } else {
        state.pop();
      }
    }

    if (
      char === '{' &&
      i >= 1 &&
      state[state.length - 1] !== 'singleQuote' &&
      state[state.length - 1] !== 'doubleQuote'
    ) {
      if (lineContent.charAt(i - 1) === '$') {
        state.push('expression');
      }
    }

    if (char === '}' && state[state.length - 1] === 'expression') {
      state.pop();
    }
    i++;
  }

  return state.pop();
};

/**
 * This function computes what edits should be applied to the document
 * based on the selected text in the editor and selected text from LG editor menu.
 * @param text LG toolbar selected item text.
 * @param editor LG editor instance.
 */
export const computeRequiredEdits = (
  text: string,
  editor: any
): { range: any; text: string; forceMoveMarkers: boolean }[] | undefined => {
  if (editor) {
    const position = editor.getPosition() ?? { lineNumber: 1, column: 1 };
    let value = editor.getModel()?.getLineContent(position.lineNumber) ?? '';
    const selection = editor.getSelection();
    const textSelected = selection?.startColumn !== editor.getSelection()?.endColumn;
    let selectedValue = '';

    if (selection && textSelected) {
      value = editor.getModel()?.getValueInRange({ ...selection, startColumn: 1 }) ?? '';
      selectedValue = editor.getModel()?.getValueInRange(selection) ?? '';
      value = value.replace(selectedValue, '');
    }

    const hasDash = templateStartRegex.test(value);

    const context = getCursorContext(editor);

    const insertText = context === 'expression' ? text : `\${${text}}`;

    const edits: { range: any; text: string; forceMoveMarkers: boolean }[] = [];

    if (!hasDash) {
      edits.push({
        range:
          textSelected && selection
            ? {
                startLineNumber: selection.startLineNumber,
                startColumn: 1,
                endLineNumber: selection.startLineNumber,
                endColumn: templateStart.length,
              }
            : {
                startLineNumber: position.lineNumber,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: templateStart.length,
              },
        text: templateStart,
        forceMoveMarkers: textSelected,
      });
    }

    edits.push({
      range:
        textSelected && selection
          ? {
              startLineNumber: selection.startLineNumber,
              startColumn: selection.startColumn + (hasDash ? 0 : templateStart.length),
              endLineNumber: selection.endLineNumber,
              endColumn: selection.endColumn,
            }
          : {
              startLineNumber: position.lineNumber,
              startColumn: position.column + (hasDash ? 0 : templateStart.length),
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
      text: insertText,
      forceMoveMarkers: textSelected,
    });

    return edits;
  }
};

/**
 * Converts the list pf properties to a tree and returns the root.
 * @param properties List of available properties.
 */
export const computePropertyItemTree = (properties: readonly string[]): PropertyItem => {
  const items = properties.slice().sort();
  const dummyRoot = { id: 'root', children: [] };

  const helper = (currentNode: PropertyItem, prefix: string, scopedItems: string[], level: number) => {
    const uniques = uniq(scopedItems.map((i) => i.split('.')[level])).filter(Boolean);
    const children = uniques.map((id) => ({ id: id, children: [] }));
    for (const n of children) {
      helper(
        n,
        `${prefix}${prefix ? '.' : ''}${n.id}`,
        items.filter((i) => i.startsWith(`${prefix}${prefix ? '.' : ''}${n.id}`)),
        level + 1
      );
    }
    currentNode.children = children;
  };

  helper(dummyRoot, '', items, 0);

  return dummyRoot;
};

const getPath = <T extends { id: string; children?: T[] }>(item: T, parents: Record<string, T>) => {
  const path: string[] = [];
  let currentItem = item;
  if (currentItem) {
    while (currentItem) {
      path.push(currentItem.id);
      currentItem = parents[currentItem.id];
      while (currentItem && currentItem.id.indexOf('root') !== -1) {
        currentItem = parents[currentItem.id];
      }
    }
  }
  return path.reverse().join('.');
};

export const getAllNodes = <T extends { id: string; children?: T[] }>(
  root: T,
  options?: Partial<{ expanded: Record<string, boolean>; skipRoot: boolean }>
): {
  nodes: T[];
  levels: Record<string, number>;
  parents: Record<string, T>;
  paths: Record<string, string>;
  descendantCount: Record<string, number>;
} => {
  const nodes: T[] = [];
  const levels: Record<string, number> = {};
  const parents: Record<string, T> = {};
  const paths: Record<string, string> = {};
  const descendantCount: Record<string, number> = {};

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

  const countHelper = (node: T) => {
    let sum = 0;
    for (const n of node?.children ?? []) {
      sum += countHelper(n);
    }

    descendantCount[node.id] = sum + (node.children?.length ?? 0);
    return descendantCount[node.id];
  };

  addNode(root, null);
  countHelper(root);

  return { nodes, levels, parents, paths, descendantCount };
};
