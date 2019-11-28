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

let luFile = `@ list listCity
@ prebuilt number
@ prebuilt geographyV2
@ regex regexZipcode = /[0-9]{5}/
@ ml address hasRoles fromAddress, toAddress
@ address =
- @ number 'door number'
- @ ml streetName
- @ ml location usesFeature geographyV2
- @ listCity city
- @ regexZipcode zipcode`;

extractLUISContent(luFile)
  .then(luisJson => {
    console.log(luisJson.entities[0].roles);
  })
  .catch(e => {
    console.log('error');
  });

function getRangeAtPosition(document: TextDocument, position: Position): Range | undefined {
  let range: Range;
  const text = document.getText();
  const line = position.line;
  const pos = position.character;
  const lineText = text.split('\n')[line];
  let match: RegExpMatchArray | null;
  const wordDefinition = /[a-zA-Z0-9_/-/.]+/g;
  while ((match = wordDefinition.exec(lineText))) {
    const matchIndex = match.index || 0;
    if (matchIndex > pos) {
      return undefined;
    } else if (wordDefinition.lastIndex >= pos) {
      return Range.create(line, 1 + matchIndex, line, 1 + wordDefinition.lastIndex);
    }
  }
}
