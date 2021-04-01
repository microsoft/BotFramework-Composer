// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { generateDesignerId, LgTemplate } from '@bfc/shared';

import { LgLanguageContext } from '../lg/types';

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

export const getUniqueTemplateName = (templateId: string, templates?: readonly LgTemplate[]): string => {
  const id = `${templateId}_${generateDesignerId()}`;
  return !templates || templates.find(({ name }) => name === id)
    ? (getUniqueTemplateName(templateId, templates) as string)
    : id;
};
