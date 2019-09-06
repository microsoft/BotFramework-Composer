import { Resource, ResourceResolver } from '../resource/interface';

// Validator interface is also resource-based
export interface ResourceValidator {
  validate(resource: Resource, resolver: ResourceResolver): Diagnostic[];
}

export interface Diagnostic {
  severity: DiagnosticSeverity;
  message: string;
  range: Range;
  source?: string;
  code?: string;
}

export interface Range {
  start: Position;
  end: Position;
}

export interface Position {
  line: number;
  character: number;
}

export enum DiagnosticSeverity {
  Error = 0,
  Warning = 1,
  Information = 2,
  Hint = 3,
}
