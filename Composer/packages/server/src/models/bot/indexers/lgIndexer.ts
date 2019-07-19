import { LGParser, StaticChecker, DiagnosticSeverity, Diagnostic } from 'botbuilder-lg';
import { get } from 'lodash';

import { Path } from '../../../utility/path';
import { FileInfo, LGFile } from '../interface';

export class LGIndexer {
  private lgFiles: LGFile[] = [];

  public index(files: FileInfo[]) {
    if (files.length === 0) return [];
    this.lgFiles = [];
    for (const file of files) {
      const extName = Path.extname(file.name);
      if (extName === '.lg') {
        this.lgFiles.push({
          id: Path.basename(file.name, extName),
          relativePath: file.relativePath,
          content: file.content,
          diagnostics: this.staticCheck(file.content, file.name),
        });
      }
    }
  }

  public getLgFiles() {
    return this.lgFiles;
  }

  public staticCheck(content: string, name: string = '') {
    return StaticChecker.checkText(content, name);
  }

  public isValid(content: string) {
    return StaticChecker.checkText(content, name).filter(d => d.Severity === DiagnosticSeverity.Error).length === 0;
  }

  public parse(content: string, name: string = '') {
    try {
      const resource = LGParser.parse(content, name);
      return {
        isValid: true,
        resource,
        error: null,
        errorMsg: '',
      };
    } catch (error) {
      const errorMsg = get(error, 'Diagnostics', []).reduce((msg: string, err: Diagnostic) => {
        const { Start, End } = err.Range;
        const errorDetail = `line ${Start.Line}:${Start.Character} - line ${End.Line}:${End.Character}`;

        msg += `${errorDetail} \n ${err.Message}\n`;
        return msg;
      }, '');
      return {
        isValid: false,
        resource: null,
        error,
        errorMsg,
      };
    }
  }
}
