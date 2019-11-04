// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LGParser, StaticChecker, DiagnosticSeverity, Diagnostic, LGTemplate } from 'botbuilder-lg';
import { get } from 'lodash';

const lgStaticChecker = new StaticChecker();

interface Template {
  Name: string;
  Parameters: string[];
  Body: string;
}

export function isValid(diagnostics: Diagnostic[]): boolean {
  return diagnostics.every(d => d.Severity !== DiagnosticSeverity.Error);
}

export function check(content: string, id = ''): Diagnostic[] {
  return lgStaticChecker.checkText(content, id);
}

export function parse(content: string, id = ''): LGTemplate[] {
  const resource = LGParser.parse(content, id);
  return get(resource, 'Templates', []);
}

export function updateTemplate(content: string, templateName: string, { Name, Parameters, Body }: Template): string {
  const resource = LGParser.parse(content);
  // add if not exist
  if (resource.Templates.findIndex(t => t.Name === templateName) === -1) {
    return resource.addTemplate(Name, Parameters, Body).toString();
  } else {
    return resource.updateTemplate(templateName, Name, Parameters, Body).toString();
  }
}

export function addTemplate(content: string, { Name, Parameters, Body }: Template): string {
  const resource = LGParser.parse(content);
  return resource.addTemplate(Name, Parameters, Body).toString();
}

export function removeTemplate(content: string, templateName: string): string {
  const resource = LGParser.parse(content);
  return resource.deleteTemplate(templateName).toString();
}

export function combineMessage(diagnostics: Diagnostic[]): string {
  return diagnostics.reduce((msg, d) => {
    const { Start, End } = d.Range;
    const position = `line ${Start.Line}:${Start.Character} - line ${End.Line}:${End.Character}`;

    msg += `${position} \n ${d.Message}\n`;
    return msg;
  }, '');
}
