// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * lgUtil.ts is a single place use lg-parser handle lg file operation.
 * it's designed have no state, input text file, output text file.
 *
 */

import { LGParser, StaticChecker, DiagnosticSeverity, ImportResolver, Diagnostic, LGTemplate } from 'botbuilder-lg';
import get from 'lodash/get';

const lgStaticChecker = new StaticChecker();

const lgImportResolver = ImportResolver.fileResolver;

export interface Template {
  Name: string;
  Parameters?: string[];
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

export function createSingleMessage(diagnostic: Diagnostic): string {
  const { Start, End } = diagnostic.Range;
  const position = `line ${Start.Line}:${Start.Character} - line ${End.Line}:${End.Character}`;

  return `${position} \n ${diagnostic.Message}\n`;
}

export function combineMessage(diagnostics: Diagnostic[]): string {
  return diagnostics.reduce((msg, d) => {
    msg += createSingleMessage(d);
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

export function updateTemplate(
  content: string,
  templateName: string,
  { Name, Parameters = [], Body }: Template
): string {
  const resource = LGParser.parse(content);
  // add if not exist
  if (resource.Templates.findIndex(t => t.Name === templateName) === -1) {
    return resource.addTemplate(Name, Parameters, Body).toString();
  } else {
    return resource.updateTemplate(templateName, Name, Parameters, Body).toString();
  }
}

// if Name exist, throw error.
export function addTemplate(content: string, { Name, Parameters = [], Body }: Template): string {
  const resource = LGParser.parse(content);
  return resource.addTemplate(Name, Parameters, Body).toString();
}

// if Name exist, add it anyway, with name like `${Name}1` `${Name}2`
export function addTemplateAnyway(
  content: string,
  { Name = 'TemplateName', Parameters = [], Body = '-TemplateBody' }: Template
): string {
  const resource = LGParser.parse(content);
  const newName = increaseNameUtilNotExist(resource.Templates, Name);

  return resource.addTemplate(newName, Parameters, Body).toString();
}

// if toTemplateName exist, throw error.
export function copyTemplate(content: string, fromTemplateName: string, toTemplateName: string): string {
  const resource = LGParser.parse(content);
  const fromTemplate = resource.Templates.find(t => t.Name === fromTemplateName);
  if (!fromTemplate) {
    throw new Error('fromTemplateName no exist');
  }
  const { Parameters, Body } = fromTemplate;
  return resource.addTemplate(toTemplateName, Parameters, Body).toString();
}

// if toTemplateName exist, add it anyway, with name like `${toTemplateName}1` `${toTemplateName}2`
export function copyTemplateAnyway(content: string, fromTemplateName: string, toTemplateName?: string): string {
  const resource = LGParser.parse(content);
  const fromTemplate = resource.Templates.find(t => t.Name === fromTemplateName);
  if (!fromTemplate) {
    return resource.toString();
  }

  let newName = toTemplateName;
  if (!newName) {
    const copyName = `${fromTemplate.Name}_Copy`;
    newName = increaseNameUtilNotExist(resource.Templates, copyName);
  }
  const { Parameters, Body } = fromTemplate;
  return resource.addTemplate(newName, Parameters, Body).toString();
}

export function getTemplate(content: string, templateName: string): LGTemplate | undefined {
  const resource = LGParser.parse(content);
  return resource.Templates.find(t => t.Name === templateName);
}

/**
 *
 * @param text string
 * -[Greeting], I'm a fancy bot, [Bye] ---> ['Greeting', 'Bye']
 *
 */
export function extractTemplateNames(text: string): string[] {
  const templateNames: string[] = [];
  // match a template name match a temlate func  e.g. `showDate()`
  // eslint-disable-next-line security/detect-unsafe-regex
  const reg = /\[([A-Za-z_][-\w]+)(\(.*\))?\]/g;
  let matchResult;
  while ((matchResult = reg.exec(text)) !== null) {
    const templateName = matchResult[1];
    templateNames.push(templateName);
  }
  return templateNames;
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

export function textFromTemplates(templates: Template[]): string {
  let text = '';

  templates.forEach(template => {
    if (template.Name && template.Body !== null && template.Body !== undefined) {
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

export function checkSingleLgTemplate(template: Template) {
  const content = textFromTemplates([template]);

  if (parse(content).length !== 1) {
    throw new Error('Not a single template');
  }
}
