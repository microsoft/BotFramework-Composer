import { LGParser, StaticChecker, DiagnosticSeverity, Diagnostic } from 'botbuilder-lg';

import { Path } from '../../../utility/path';
import { FileInfo, LGFile, LGTemplate } from '../interface';

export class LGIndexer {
  private lgFiles: LGFile[] = [];

  public index(files: FileInfo[]): LGFile[] {
    if (files.length === 0) return [];
    this.lgFiles = [];
    for (const file of files) {
      const extName = Path.extname(file.name);
      if (extName === '.lg') {
        const diagnostics = StaticChecker.checkText(file.content, file.path);
        let templates: LGTemplate[] = [];
        try {
          templates = this.parse(file.content, '');
        } catch (err) {
          console.error(err);
        }
        this.lgFiles.push({
          id: Path.basename(file.name, extName),
          relativePath: file.relativePath,
          content: file.content,
          templates,
          diagnostics,
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

  public parse(content: string, id: string): LGTemplate[] {
    const resource = LGParser.parse(content, id);
    const templates = resource.Templates.map(t => {
      return { Name: t.Name, Body: t.Body, Parameters: t.Parameters };
    });
    return templates;
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
