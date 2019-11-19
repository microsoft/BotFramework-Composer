const parseFile = require('@microsoft/bf-lu/lib/parser/lufile/parseFileContents.js').parseFile;
const validateLUISBlob = require('@microsoft/bf-lu/lib/parser/luis/luisValidator');

import {
  TextDocument,
  Diagnostic,
  CompletionList,
  Hover,
  Position,
  CompletionItemKind,
  Range,
  DiagnosticSeverity,
} from 'vscode-languageserver-types';

async function LuSyntaxCheck(content: string): Promise<{ parsedContent: any; errors: any }> {
  let errors: Diagnostic[] = [];
  let parsedContent: any;
  try {
    parsedContent = await parseFile(content, false, 'en-us');
  } catch (e) {
    e.text.split('\n').forEach(msg => {
      const matched = msg.match(/line\s(\d+:\d+)/g);
      const positions: Position[] = [];
      matched.forEach(element => {
        let { row, col } = element.match(/(?<row>\d+):(?<col>\d+)/).groups;
        positions.push(Position.create(parseInt(row) - 1, parseInt(col)));
      });

      const range = Range.create(positions[0], positions[1]);
      console.log(range);
      const diagnostic: Diagnostic = Diagnostic.create(range, msg, DiagnosticSeverity.Error);
      errors.push(diagnostic);
    });
  }

  return Promise.resolve({ parsedContent, errors });
}

async function LuSemanticCheck(content: string): Promise<any> {
  let errors: Diagnostic[] = [];
  LuSyntaxCheck(content).then(result => {
    console.log(result);
    const luisJson = result.parsedContent.LUISJsonStructure;
    errors = result.errors;
    try {
      validateLUISBlob(luisJson);
    } catch (e) {
      e.text.split('\n').forEach(msg => {
        const matched = msg.match(/line\s(\d+:\d+)/g);
        const positions: Position[] = [];
        matched.forEach(element => {
          let { row, col } = element.match(/(?<row>\d+):(?<col>\d+)/).groups;
          positions.push(Position.create(parseInt(row) - 1, parseInt(col)));
        });

        const range = Range.create(positions[0], positions[1]);
        const diagnostic: Diagnostic = Diagnostic.create(range, msg, DiagnosticSeverity.Error);
        errors.push(diagnostic);
      });
    }
  });

  return Promise.resolve(errors);
}

let luFile = `# Greeting
- hi {commPreference}
$commPreference:simple
$commPreference:phraseList
- m&m,mars,mints,spearmings,payday,jelly,kit kat,kitkat,twix`;

LuSemanticCheck(luFile);
