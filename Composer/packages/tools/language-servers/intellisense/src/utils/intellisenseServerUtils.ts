// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Position, Range, TextDocument } from 'vscode-languageserver';

export const getRangeAtPosition = (document: TextDocument, position: Position): Range | undefined => {
  const text = document.getText();
  const line = position.line;
  const pos = position.character;

  if (line >= text.split('\n').length) {
    return undefined;
  }
  const lineText = text.split('\n')[line];
  let match: RegExpMatchArray | null;

  const wordDefinition = /[a-zA-Z0-9_/.-]+/g;
  while ((match = wordDefinition.exec(lineText))) {
    const matchIndex = match.index || 0;
    if (matchIndex > pos) {
      return undefined;
    } else if (wordDefinition.lastIndex >= pos) {
      return Range.create(line, matchIndex, line, wordDefinition.lastIndex);
    }
  }

  return undefined;
};

export const getCompletionString = (currentWord: string, completionLabel: string): string => {
  const currentWordArray = currentWord.split('.');
  const completionLabelArray = completionLabel.split('.');

  const completionArray = completionLabelArray.slice(currentWordArray.length - 1);
  const completionString = completionArray.join('.');

  return completionString;
};
