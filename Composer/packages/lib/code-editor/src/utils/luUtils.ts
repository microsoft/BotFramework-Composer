// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LuEntity } from '@botframework-composer/types';
import formatMessage from 'format-message';

import { ToolbarLuEntityType } from '../lu/types';

import { MonacoEdit, MonacoPosition, MonacoRange } from './monacoTypes';

export const getEntityTypeDisplayName = (entityType: ToolbarLuEntityType) => {
  switch (entityType) {
    case 'prebuilt':
      return formatMessage('Prebuilt entity');
    case 'ml':
      return formatMessage('Machine learned entity');
    case 'list':
      return formatMessage('List entity');
    case 'composite':
      return formatMessage('Composite entity');
    case 'regex':
      return formatMessage('Regular expression entity');
  }
};

const findFirstMissingIndex = (arr: number[], start: number, end: number): number => {
  if (start > end) return end + 1;

  if (start + 1 !== arr[start]) return start;

  const mid = Math.floor(start + (end - start) / 2);

  if (arr[mid] === mid + 1) {
    return findFirstMissingIndex(arr, mid + 1, end);
  }

  return findFirstMissingIndex(arr, start, mid);
};

export const getDuplicateName = (name: string, allNames: readonly string[]) => {
  if (!name) {
    return '';
  }

  const getBestIndex = (origName: string) => {
    const pattern = `^${origName}(-[0-9]+)*$`;
    // eslint-disable-next-line security/detect-non-literal-regexp
    const regex = new RegExp(pattern);
    const otherNames = allNames.filter((n) => regex.test(n));
    const indices: number[] = [];
    for (const otherName of otherNames) {
      try {
        const matched = otherName.match(regex);
        if (matched) {
          const { 1: otherIdxString } = matched;
          const otherIdx = parseInt(otherIdxString.slice(1));
          indices.push(otherIdx);
        }
      } catch {
        continue;
      }
    }

    if (!otherNames.length) {
      return;
    }

    if (!indices.length) {
      return 1;
    }

    indices.sort((a, b) => a - b);
    const maxIdx = Math.max(...indices);

    const firstAvailableIdx = findFirstMissingIndex(indices, 0, indices.length - 1);

    return firstAvailableIdx === -1 ? maxIdx + 1 : firstAvailableIdx + 1;
  };

  const cpIndex = name.lastIndexOf('-');
  const originalName = cpIndex === -1 ? name : name.substring(0, cpIndex);

  const bestIndex = getBestIndex(originalName);

  return bestIndex ? `${originalName}-${bestIndex}` : originalName;
};

const getLuText = (entityType: ToolbarLuEntityType, entity: string, entities: readonly string[] = []) => {
  const entityName = getDuplicateName(entity, entities);
  switch (entityType) {
    case 'ml':
      return `@ ml ${entityName}`;
    case 'prebuilt':
      return `@ prebuilt ${entityName}`;
    case 'list':
      return `@ list ${entityName}`;
    case 'composite':
      return `@ composite ${entityName}`;
    case 'regex':
      return `@ regex ${entityName}`;
  }
};

export const computeDefineLuEntityEdits = (
  entityType: ToolbarLuEntityType,
  entityName: string,
  editor: any,
  entities: readonly LuEntity[]
): { edits: MonacoEdit[]; selection?: MonacoRange; scrollLine?: number } | undefined => {
  if (editor) {
    const lineCount = editor.getModel().getLineCount();
    const firstLineContent = editor.getModel().getLineContent(1).trim();

    const insertText = getLuText(
      entityType,
      entityName,
      entities.map((e) => e.Name)
    );

    const edits: MonacoEdit[] = [];

    let lineNumber = lineCount === 1 && firstLineContent === '' ? 1 : lineCount + 1;

    // Insert one line gap at the end of the file if file has content
    if (lineCount !== 1 || firstLineContent !== '') {
      edits.push({
        range: {
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: 1,
        },
        text: '\n\n',
        forceMoveMarkers: true,
      });

      lineNumber += 1;
    }

    edits.push({
      range: {
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: 1,
      },
      text: insertText,
      forceMoveMarkers: true,
    });

    return {
      edits,
      scrollLine: lineNumber,
      selection:
        entityType !== 'prebuilt'
          ? {
              startLineNumber: lineNumber,
              startColumn: 1 + insertText.length,
              endLineNumber: lineNumber,
              // length of ' @ ' is 3
              endColumn: 1 + entityType.length + 3,
            }
          : undefined,
    };
  }
};

export const computeInsertLuEntityEdits = (entityName: string, editor: any) => {
  if (editor) {
    const position: MonacoPosition = editor.getPosition() ?? { lineNumber: 1, column: 1 };
    const selection: MonacoRange = editor.getSelection();

    const selectedText = editor.getModel()?.getValueInRange(selection) ?? '';

    const insertText = selectedText ? `{${entityName} = ${selectedText}}` : `{${entityName}}`;
    const edits: MonacoEdit[] = [];

    edits.push({
      range:
        selectedText && selection
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
      forceMoveMarkers: true,
    });

    return edits;
  }
};

export const isLineUtterance = (line?: string): boolean => {
  return !!line && /^-.*$/.test(line);
};

const brackets = ['{', '}'];

const isSelectionWithinBracketsHelper = (lineContent: string, startColumn: number, endColumn: number) => {
  for (let i = startColumn - 2; i > -1; i--) {
    if (lineContent[i] === '{' && (i === 0 || (i > 0 && lineContent[i - 1] !== '\\'))) {
      return true;
    } else if (lineContent[i] === '}' && (i === 0 || (i > 0 && lineContent[i - 1] !== '\\'))) {
      break;
    }
  }

  for (let j = endColumn - 1; j < lineContent.length; j++) {
    if (lineContent[j] === '}' && (j === 0 || (j > 0 && lineContent[j - 1] !== '\\'))) {
      return true;
    } else if (lineContent[j] === '{' && (j === 0 || (j > 0 && lineContent[j - 1] !== '\\'))) {
      break;
    }
  }

  return false;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isPositionWithinBrackets = (lineContent?: string, position?: MonacoPosition): boolean => {
  if (!lineContent || !position) {
    return false;
  }

  const startColumn = position.column;
  const endColumn = position.column;

  // if position is open or close bracket that is not escaped, return true
  if (
    brackets.includes(lineContent[startColumn - 1]) &&
    (startColumn === 0 || (startColumn > 0 && lineContent[startColumn - 2] !== '\\'))
  ) {
    return true;
  }

  return isSelectionWithinBracketsHelper(lineContent, startColumn, endColumn);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isSelectionWithinBrackets = (lineContent?: string, selection?: any, selectedText?: string): boolean => {
  if (!lineContent || !selection || !selectedText) {
    return false;
  }

  if (selectedText.startsWith('{') && selectedText.endsWith('}')) {
    return false;
  }

  // if selectedText contains an open or close bracket that is not escaped, return true
  for (let i = 0; i < selectedText.length; i++) {
    if (brackets.includes(selectedText[i]) && (i === 0 || (i > 0 && selectedText[i - 1] !== '\\'))) {
      return true;
    }
  }

  const { startColumn, endColumn } = selection;

  return isSelectionWithinBracketsHelper(lineContent, startColumn, endColumn);
};

export const canInsertEntityBySelection = (editor: any, selection: MonacoRange): boolean => {
  const lineContent = editor.getModel().getLineContent(selection.startLineNumber);
  const selectedText = editor.getModel().getValueInRange(selection);

  return (
    isLineUtterance(lineContent) &&
    (selectedText
      ? !isSelectionWithinBrackets(lineContent, selection, selectedText)
      : !isPositionWithinBrackets(lineContent, {
          lineNumber: selection.startLineNumber,
          column: selection.startColumn,
        }))
  );
};

export const canTagEntityBySelection = (editor: any, selection: MonacoRange): boolean => {
  const lineContent = editor.getModel().getLineContent(selection.startLineNumber);
  const selectedText = editor.getModel().getValueInRange(selection);

  return isLineUtterance(lineContent) && !isSelectionWithinBrackets(lineContent, selection, selectedText);
};
