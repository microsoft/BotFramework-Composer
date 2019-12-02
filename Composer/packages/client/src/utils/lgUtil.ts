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
  name: string;
  parameters?: string[];
  body: string;
}

export function isValid(diagnostics: Diagnostic[]): boolean {
  return diagnostics.every(d => d.severity !== DiagnosticSeverity.Error);
}

export function check(content: string, id = ''): Diagnostic[] {
  return lgStaticChecker.checkText(content, id, lgImportResolver);
}

export function parse(content: string, id = ''): LGTemplate[] {
  const resource = LGParser.parse(content, id);
  return get(resource, 'templates', []);
}

export function createSingleMessage(diagnostic: Diagnostic): string {
  const { start, end } = diagnostic.range;
  const position = `line ${start.line}:${start.character} - line ${end.line}:${end.character}`;

  return `${position} \n ${diagnostic.message}\n`;
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

  while (templates.findIndex(item => item.name === newName) !== -1) {
    repeatIndex += 1;
    newName = name + repeatIndex.toString();
  }
  return newName;
}

export function updateTemplate(
  content: string,
  templateName: string,
  { name, parameters = [], body }: Template
): string {
  const resource = LGParser.parse(content);
  // add if not exist
  if (resource.templates.findIndex(t => t.name === templateName) === -1) {
    return resource.addTemplate(name, parameters, body).toString();
  } else {
    return resource.updateTemplate(templateName, name, parameters, body).toString();
  }
}

// if name exist, throw error.
export function addTemplate(content: string, { name, parameters = [], body }: Template): string {
  const resource = LGParser.parse(content);
  return resource.addTemplate(name, parameters, body).toString();
}

// if name exist, add it anyway, with name like `${name}1` `${name}2`
export function addTemplateAnyway(
  content: string,
  { name = 'TemplateName', parameters = [], body = '-TemplateBody' }: Template
): string {
  const resource = LGParser.parse(content);
  const newName = increaseNameUtilNotExist(resource.templates, name);

  return resource.addTemplate(newName, parameters, body).toString();
}

// if toTemplateName exist, throw error.
export function copyTemplate(content: string, fromTemplateName: string, toTemplateName: string): string {
  const resource = LGParser.parse(content);
  const fromTemplate = resource.templates.find(t => t.name === fromTemplateName);
  if (!fromTemplate) {
    throw new Error('fromTemplateName no exist');
  }
  const { parameters, body } = fromTemplate;
  return resource.addTemplate(toTemplateName, parameters, body).toString();
}

// if toTemplateName exist, add it anyway, with name like `${toTemplateName}1` `${toTemplateName}2`
export function copyTemplateAnyway(content: string, fromTemplateName: string, toTemplateName?: string): string {
  const resource = LGParser.parse(content);
  const fromTemplate = resource.templates.find(t => t.name === fromTemplateName);
  if (!fromTemplate) {
    return resource.toString();
  }

  let newName = toTemplateName;
  if (!newName) {
    const copyName = `${fromTemplate.name}_Copy`;
    newName = increaseNameUtilNotExist(resource.templates, copyName);
  }
  const { parameters, body } = fromTemplate;
  return resource.addTemplate(newName, parameters, body).toString();
}

export function getTemplate(content: string, templateName: string): LGTemplate | undefined {
  const resource = LGParser.parse(content);
  return resource.templates.find(t => t.name === templateName);
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
    if (template.name && (template.body !== null && template.body !== undefined)) {
      text += `# ${template.name.trim()}`;
      if (template.parameters && template.parameters.length > 0) {
        text += '(' + template.parameters.join(', ') + ')';
      }
      text += '\n';
      text += `${template.body.trim()}`;
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
