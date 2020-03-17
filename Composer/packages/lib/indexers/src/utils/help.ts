// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function getBaseName(filename: string, sep?: string): string | any {
  if (sep) return filename.substr(0, filename.lastIndexOf(sep));
  return filename.substring(0, filename.lastIndexOf('.')) || filename;
}

// split text to lines
export function splitNewlineText(text: string): string[] {
  return text.split('\n');
}

// convert lines to \r\n text
export function buildNewlineText(lineArray: string[]): string {
  const lineArrayEndWithRN = lineArray.map(line => {
    if (line.endsWith('\r\n')) {
      return line;
    } else if (line.endsWith('\r')) {
      return line + '\n';
    } else {
      return line + '\r\n';
    }
  });
  return lineArrayEndWithRN.join('');
}
