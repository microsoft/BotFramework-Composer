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
          diagnostics: StaticChecker.checkText(file.content, file.name),
        });
      }
    }
    return this.lgFiles;
  }

  public getLgFiles(): LGFile[] {
    return this.lgFiles;
  }

  public isValid(content: string): boolean {
    return StaticChecker.checkText(content, name).filter(d => d.Severity === DiagnosticSeverity.Error).length === 0;
  }

  public parse(
    content: string,
    name: string = ''
  ): {
    templates: LGTemplate[];
    diagnostics: Diagnostic[];
  } {
    const resource = LGParser.parse(content, name);
    const diagnostics = StaticChecker.checkText(content, name);
    return {
      templates: get(resource, 'Templates', []),
      diagnostics,
    };
  }
}
