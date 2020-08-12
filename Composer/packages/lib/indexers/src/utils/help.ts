// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function getBaseName(filename: string, sep?: string): string {
  if (sep) return filename.substr(0, filename.lastIndexOf(sep));
  return filename.substring(0, filename.lastIndexOf('.')) || filename;
}

export function getExtension(filename: string): string | undefined {
  const re = /\.[^.]+$/;
  return re.exec(filename)?.[0];
}

export function getLocale(fileId: string): string | undefined {
  return /\w\.\w/.test(fileId) ? fileId.split('.').pop() : '';
}

// split text to lines
export function splitNewlineText(text: string): string[] {
  return text.split('\n');
}

// convert lines to \r\n text
export function buildNewlineText(lineArray: string[]): string {
  if (lineArray.length < 2) return lineArray.join('');
  const lastLine = lineArray.pop();
  const linesWithRN = lineArray.map((line) => {
    if (line.endsWith('\r\n')) {
      return line;
    } else if (line.endsWith('\r')) {
      return line + '\n';
    } else {
      return line + '\r\n';
    }
  });
  const lastLineWithRN = lastLine && lastLine.endsWith('\r') ? lastLine + '\n' : lastLine;
  return [...linesWithRN, lastLineWithRN].join('');
}
