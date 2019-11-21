const parseFile = require('@bfcomposer/bf-lu/lib/parser/lufile/parseFileContents.js').parseFile;
const validateLUISBlob = require('@bfcomposer/bf-lu/lib/parser/luis/luisValidator');

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

async function extractLUISContent(text: string): Promise<any> {
  let parsedContent: any;
  try {
    parsedContent = await parseFile(text, false, 'en-us');
  } catch (e) {
    // nothong to do in catch block
  }

  if (parsedContent !== undefined) {
    return Promise.resolve(parsedContent.LUISJsonStructure);
  } else {
    return undefined;
  }
}

let luFile = `@ simple ma
@ simple na

# hi
- ni { ma = "ok"}`;

extractLUISContent(luFile)
  .then(luisJson => {
    console.log(luisJson);
  })
  .catch(e => {
    console.log('error');
  });
