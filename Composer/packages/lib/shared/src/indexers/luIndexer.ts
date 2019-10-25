import ludown from 'ludown';
import trimend from 'lodash.trimend';

import { FileInfo, LuFile, LuDiagnostic } from '../types';

async function index(files: FileInfo[]) {
  if (files.length === 0) return [];
  const luFiles: LuFile[] = [];
  for (const file of files) {
    if (file.name.endsWith('.lu')) {
      const diagnostics: LuDiagnostic[] = [];
      let parsedContent: any = {};
      try {
        parsedContent = await parse(file.content);
      } catch (err) {
        diagnostics.push(err);
      }
      luFiles.push({
        diagnostics,
        id: trimend(file.name, '.lu'),
        relativePath: file.relativePath,
        content: file.content,
        parsedContent,
      });
    }
  }
}

function parse(content: string): Promise<any> {
  const log = false;
  const locale = 'en-us';

  return ludown.parser.parseFile(content, log, locale);
}

export const luIndexer = {
  index,
  parse,
};
