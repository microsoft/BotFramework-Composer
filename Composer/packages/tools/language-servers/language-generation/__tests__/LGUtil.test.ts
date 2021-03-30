/* eslint-disable @typescript-eslint/camelcase */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Position, Range } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DiagnosticSeverity } from 'vscode-languageserver-types';
import { Diagnostic as lgDiagnostic, DiagnosticSeverity as lgDiagnosticSeverity } from 'botbuilder-lg';

import {
  getRangeAtPosition,
  getEntityRangeAtPosition,
  extractLUISContent,
  getSuggestionEntities,
  suggestionAllEntityTypes,
  generateDiagnostic,
  convertDiagnostics,
  convertSeverity,
} from '../lib/utils';
import { LgParser } from '../lib/lgParser';

const textDoc: TextDocument = {
  getText: () => '-this is an entity: ${@name}',
  uri: 'inmemory://model/1',
  languageId: 'botbuilderlg',
  version: 2,
  positionAt: (offset: number) => Position.create(offset, offset),
  offsetAt: (pos: Position) => pos.character,
  lineCount: 2,
};

const textDoc2: TextDocument = {
  getText: () => 'line0\r\nline1\r\nline2\r\nline3',
  uri: 'inmemory://model/1',
  languageId: 'botbuilderlg',
  version: 2,
  positionAt: (offset: number) => Position.create(offset, offset),
  offsetAt: (pos: Position) => pos.character,
  lineCount: 4,
};

const luisObj = {
  closedLists: [],
  composites: [],
  culture: 'en-us',
  desc: '',
  entities: [{ explicitlyAdded: true, name: 'name', roles: [] }],
  intents: [],
  luis_schema_version: '3.2.0',
  model_features: [],
  name: '',
  patternAnyEntities: [],
  patterns: [],
  prebuiltEntities: [{ name: 'number', roles: ['age'] }],
  regex_entities: [{ name: 'zipcode', regexPattern: '', roles: [] }],
  regex_features: [],
  utterances: [],
  versionId: '0.1',
};

const luisText = '@ ml name\r\n @ prebuilt number age\r\n @regex zipcode';
const lgText = '#Temp1\r\n -welcome\r\n #Temp2\r\n-greeting';

const lgDiagnostics = [
  new lgDiagnostic(Range.create(0, 0, 0, 10), 'No template name', DiagnosticSeverity.Error),
  new lgDiagnostic(Range.create(1, 0, 1, 10), 'No template body', DiagnosticSeverity.Warning),
];

describe('LG LSP Server Function Unit Tests', () => {
  it('Test getRangeAtPosition function', () => {
    const result = getRangeAtPosition(textDoc, Position.create(0, 3));
    expect(result).toEqual({ end: { character: 5, line: 0 }, start: { character: 1, line: 0 } });
  });

  it('Test getEntityRangeAtPosition function', () => {
    const result = getEntityRangeAtPosition(textDoc, Position.create(0, 23));
    expect(result).toEqual({ end: { character: 27, line: 0 }, start: { character: 22, line: 0 } });
  });

  it('Test extract luisJson function', async () => {
    const result = await extractLUISContent(luisText);
    expect(result.entities[0].name).toEqual('name');
    expect(result.prebuiltEntities[0].name).toEqual('number');
    expect(result.regex_entities[0].name).toEqual('zipcode');
  });

  it('Test getSuggestionEntities function', () => {
    const result = getSuggestionEntities(luisObj, suggestionAllEntityTypes);
    expect(result).toEqual(['name', 'zipcode']);
  });

  it('Test generateDiagnostic function', () => {
    const result = generateDiagnostic('No Template Found', DiagnosticSeverity.Error, textDoc2);
    expect(result.message).toEqual('No Template Found');
    expect(result.severity).toEqual(DiagnosticSeverity.Error);
  });

  it('Test convertDiagnostics function', () => {
    const result = convertDiagnostics(lgDiagnostics, textDoc2);
    expect(result.length).toEqual(2);
    expect(result[1].message).toEqual('No template body');
  });

  it('Test convertSeverity function', () => {
    const result = convertSeverity(lgDiagnosticSeverity.Error);
    expect(result).toEqual(DiagnosticSeverity.Error);
  });

  it('Test LGParser function', async () => {
    const lgParser = new LgParser();
    const result = await lgParser.extractLuisEntity([luisText]);
    expect(result).toEqual({ suggestEntities: ['name', 'zipcode'] });

    const result2 = await lgParser.parse('id', lgText, []);
    expect(result2.allTemplates.length).toEqual(2);

    const result3 = await lgParser.updateTemplate(result2, 'Temp2', { body: 'new body' }, []);
    expect(result3.allTemplates[1].body).toEqual('new body');
  });
});
