// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * lgUtil.ts is a single place use lg-parser handle lg file operation.
 * it's designed have no state, input text file, output text file.
 *
 */

import { LGParser } from 'botbuilder-lg';
import { lgIndexer, combineMessage, isValid, LgTemplate } from '@bfc/indexers';

const { check, parse } = lgIndexer;
export interface Template {
  name: string;
  parameters?: string[];
  body: string;
}

export function checkLgContent(content: string, id: string) {
  // check lg content, make up error message
  const diagnostics = check(content, id);
  if (!isValid(diagnostics)) {
    const errorMsg = combineMessage(diagnostics);
    throw new Error(errorMsg);
  }
}

export function increaseNameUtilNotExist(templates: LgTemplate[], name: string): string {
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
  { name, parameters = [], body }: LgTemplate
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
export function addTemplate(content: string, { name, parameters = [], body }: LgTemplate): string {
  const resource = LGParser.parse(content);
  return resource.addTemplate(name, parameters, body).toString();
}

// if name exist, add it anyway, with name like `${name}1` `${name}2`
export function addTemplateAnyway(
  content: string,
  { name = 'TemplateName', parameters = [], body = '-TemplateBody' }: LgTemplate
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

export function textFromTemplate(template: LgTemplate): string {
  const { name, parameters = [], body } = template;
  const textBuilder: string[] = [];
  if (name && body !== null && body !== undefined) {
    textBuilder.push(`# ${name.trim()}`);
    if (parameters.length) {
      textBuilder.push(`(${parameters.join(', ')})`);
    }
    textBuilder.push(`\n${template.body.trim()}`);
  }
  return textBuilder.join('');
}

export function textFromTemplates(templates: LgTemplate[]): string {
  const textBuilder: string[] = [];

  templates.forEach(template => {
    textBuilder.push(`${textFromTemplate(template)}\n`);
  });

  return textBuilder.join('');
}

export function checkSingleLgTemplate(template: LgTemplate) {
  const content = textFromTemplates([template]);

  if (parse(content).length !== 1) {
    throw new Error('Not a single template');
  }
}
