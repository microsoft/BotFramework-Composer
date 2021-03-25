// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { generateDesignerId, LgTemplate } from '@bfc/shared';
import uniq from 'lodash/uniq';

import { LgLanguageContext, PropertyItem } from '../lg/types';

import { MonacoPosition, MonacoRange, MonacoEdit } from './monacoTypes';

export const getCursorContextWithinLine = (lineContent: string) => {
  const state: LgLanguageContext[] = [];

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
 * This function returns the context of the current cursor position in an LG document.
 * @param editor LG editor instance.
 */
const getCursorContext = (editor: any) => {
  const position: MonacoPosition = editor.getPosition() ?? { lineNumber: 1, column: 1 };
  const range: MonacoRange = {
    startLineNumber: position.lineNumber,
    startColumn: 1,
    endLineNumber: position.lineNumber,
    endColumn: position.column,
  };
  const lineContent = editor.getModel()?.getValueInRange(range) ?? '';

  return getCursorContextWithinLine(lineContent);
};

/**
 * This function computes what edits should be applied to the document
 * based on the selected text in the editor and selected text from LG editor menu.
 * @param text LG toolbar selected item text.
 * @param editor LG editor instance.
 */
export const computeRequiredEdits = (text: string, editor: any): MonacoEdit[] | undefined => {
  if (editor) {
    const position: MonacoPosition = editor.getPosition() ?? { lineNumber: 1, column: 1 };
    const selection: MonacoRange = editor.getSelection();
    const textSelected =
      selection.startLineNumber !== selection.endLineNumber || selection.startColumn !== selection.endColumn;

    const context = getCursorContext(editor);

    const insertText = context === 'expression' ? text : `\${${text}}`;

    const edits: MonacoEdit[] = [];

    edits.push({
      range:
        textSelected && selection
          ? {
              startLineNumber: selection.startLineNumber,
              startColumn: selection.startColumn,
              endLineNumber: selection.endLineNumber,
              endColumn: selection.endColumn,
            }
          : {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
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

export const getUniqueTemplateName = (templateId: string, templates?: readonly LgTemplate[]): string => {
  const id = `${templateId}_${generateDesignerId()}`;
  return !templates || templates.find(({ name }) => name === id)
    ? (getUniqueTemplateName(templateId, templates) as string)
    : id;
};
