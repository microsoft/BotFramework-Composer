// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  LGParser,
  StaticChecker,
  DiagnosticSeverity,
  ImportResolver,
  Diagnostic,
  LGTemplate,
  LGResource,
} from 'botbuilder-lg';
import get from 'lodash.get';

const lgStaticChecker = new StaticChecker();

const lgImportResolver = ImportResolver.fileResolver;

interface Template {
  Name: string;
  Parameters: string[];
  Body: string;
}

export function isValid(diagnostics: Diagnostic[]): boolean {
  return diagnostics.every(d => d.Severity !== DiagnosticSeverity.Error);
}

export function check(content: string, id = ''): Diagnostic[] {
  return lgStaticChecker.checkText(content, id, lgImportResolver);
}

export function parse(content: string, id = ''): LGTemplate[] {
  const resource = LGParser.parse(content, id);
  return get(resource, 'Templates', []);
}

export function combineMessage(diagnostics: Diagnostic[]): string {
  return diagnostics.reduce((msg, d) => {
    const { Start, End } = d.Range;
    const position = `line ${Start.Line}:${Start.Character} - line ${End.Line}:${End.Character}`;

    msg += `${position} \n ${d.Message}\n`;
    return msg;
  }, '');
}

export function checkLgContent(content: string) {
  // check lg content, make up error message
  const diagnostics = check(content);
  if (isValid(diagnostics) === false) {
    const errorMsg = combineMessage(diagnostics);
    throw new Error(errorMsg);
  }
}

export function increaseNameUtilNotExist(templates: LGTemplate[], name: string): string {
  // if duplicate, increse name with Copy1 Copy2 ...

  let repeatIndex = 0;
  let newName = name;

  while (templates.findIndex(item => item.Name === newName) !== -1) {
    repeatIndex += 1;
    newName = name + repeatIndex.toString();
  }
  return newName;
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

export function addTemplateAnyway(
  content: string,
  { Name = 'TemplateName', Parameters = [], Body = '-TemplateBody' }: Template
): string {
  const resource = LGParser.parse(content);
  const newName = increaseNameUtilNotExist(resource.Templates, Name);

  return resource.addTemplate(newName, Parameters, Body).toString();
}

export function copyTemplate(content: string, fromTemplateName: string, toTemplateName?: string): string {
  const resource = LGParser.parse(content);
  const fromTemplate = resource.Templates.find(t => t.Name === fromTemplateName);
  if (!fromTemplate) {
    return resource.toString();
  }

  let newName = toTemplateName;
  if (!newName) {
    const copyName = `${fromTemplate.Name}.Copy`;
    newName = increaseNameUtilNotExist(resource.Templates, copyName);
  }
  const { Parameters, Body } = fromTemplate;
  return resource.addTemplate(newName, Parameters, Body).toString();
}

export function removeTemplate(content: string, templateName: string): string {
  const resource = LGParser.parse(content);
  return resource.deleteTemplate(templateName).toString();
}

export function removeTemplates(content: string, templateNames: string[]): string {
  let resource = LGParser.parse(content);
  templateNames.forEach(templateName => {
    resource = resource.deleteTemplate(templateName);
  });
  return resource.toString();
}

export function textFromTemplates(templates) {
  let text = '';

  templates.forEach(template => {
    if (template.Name && (template.Body !== null && template.Body !== undefined)) {
      text += `# ${template.Name.trim()}`;
      if (template.Parameters && template.Parameters.length > 0) {
        text += '(' + template.Parameters.join(', ') + ')';
      }
      text += '\n';
      text += `${template.Body.trim()}`;
    }
  });

  return text;
}
/**
 *
 * @param {Name: string, ?Parameters: string[], Body: string} template
 */
export function parseLgTemplate(template) {
  const content = textFromTemplates([template]);

  if (parse(content).length !== 1) {
    throw new Error('Not a single template');
  }
}
