// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function normalizeLgText(text: string): string {
  return text
    .split('\n')
    .map((line) => (line.startsWith('-') ? line.substring(1) : line))
    .join('\n');
}

export function isActivityString(text: string): boolean {
  const templateTexts = text.split('\n');
  return templateTexts[0]?.trim() === '[Activity';
}
