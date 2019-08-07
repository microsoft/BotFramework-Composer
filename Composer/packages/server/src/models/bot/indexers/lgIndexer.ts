import { LGParser, StaticChecker, DiagnosticSeverity, Diagnostic, LGTemplate } from 'botbuilder-lg';
import { get } from 'lodash';

import { Path } from '../../../utility/path';
import { FileInfo, LGFile } from '../interface';

export class LGIndexer {
  private lgFiles: LGFile[] = [];

  public index(files: FileInfo[]): LGFile[] {
    if (files.length === 0) return [];
    this.lgFiles = [];
    for (const file of files) {
      const extName = Path.extname(file.name);
      if (extName === '.lg') {
        this.lgFiles.push({
          id: Path.basename(file.name, extName),
          relativePath: file.relativePath,
          content: file.content,
          diagnostics: StaticChecker.checkText(file.content, file.path),
        });
      }
    }
    return this.lgFiles;
  }

  public getLgFiles(): LGFile[] {
    return this.lgFiles;
  }

  public isValid(diagnostics: Diagnostic[]): boolean {
    return diagnostics.every(d => d.Severity !== DiagnosticSeverity.Error);
  }

  public check(content: string, path: string): Diagnostic[] {
    return StaticChecker.checkText(content, path);
  }

  public parse(content: string, path: string): LGTemplate[] {
    const resource = LGParser.parse(content, path);
    return get(resource, 'Templates', []);
  }

  public combineMessage(diagnostics: Diagnostic[]): string {
    return diagnostics.reduce((msg, d) => {
      const { Start, End } = d.Range;
      const position = `line ${Start.Line}:${Start.Character} - line ${End.Line}:${End.Character}`;

      msg += `${position} \n ${d.Message}\n`;
      return msg;
    }, '');
  }
}
