import { TextDocument, Range, Position, DiagnosticSeverity } from 'vscode-languageserver-types';
import * as lg from 'botbuilder-lg';
export declare function getRangeAtPosition(document: TextDocument, position: Position): Range;
export declare function convertSeverity(severity: lg.DiagnosticSeverity): DiagnosticSeverity;
export declare function getLGResources(document: TextDocument): lg.LGResource;
