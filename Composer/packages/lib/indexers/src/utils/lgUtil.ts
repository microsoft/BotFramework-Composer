// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * lgUtil.ts is a single place use lg-parser handle lg file operation.
 * it's designed have no state, input text file, output text file.
 *
 */

import { Templates } from 'botbuilder-lg';
import { LgTemplate } from '@bfc/shared';

export interface Template {
  name: string;
  parameters?: string[];
  body: string;
}

export function increaseNameUtilNotExist(templates: LgTemplate[], name: string): string {
  // if duplicate, increse name with Copy1 Copy2 ...

  let repeatIndex = 0;
  let newName = name;

  while (templates.findIndex((item) => item.name === newName) !== -1) {
    repeatIndex += 1;
    newName = name + repeatIndex.toString();
  }
  return newName;
}

export function updateTemplate(
  content: string,
  templateName: string,
  { name, parameters = [], body }: LgTemplate
): Templates {
  const resource = Templates.parseText(content);
  // add if not exist
  if (resource.toArray().findIndex((t) => t.name === templateName) === -1) {
    return resource.addTemplate(name, parameters, body);
  } else {
    return resource.updateTemplate(templateName, name, parameters, body);
  }
}

// if name exist, throw error.
export function addTemplate(content: string, { name, parameters = [], body }: LgTemplate): Templates {
  const resource = Templates.parseText(content);
  return resource.addTemplate(name, parameters, body);
}

// if name exist, add it anyway, with name like `${name}1` `${name}2`
export function addTemplateAnyway(
  content: string,
  { name = 'TemplateName', parameters = [], body = '-TemplateBody' }: LgTemplate
): Templates {
  const resource = Templates.parseText(content);
  const newName = increaseNameUtilNotExist(resource.toArray(), name);

  return resource.addTemplate(newName, parameters, body);
}

// if toTemplateName exist, throw error.
export function copyTemplate(content: string, fromTemplateName: string, toTemplateName: string): Templates {
  const resource = Templates.parseText(content);
  const fromTemplate = resource.toArray().find((t) => t.name === fromTemplateName);
  if (!fromTemplate) {
    throw new Error('fromTemplateName no exist');
  }
  const { parameters, body } = fromTemplate;
  return resource.addTemplate(toTemplateName, parameters, body);
}

// if toTemplateName exist, add it anyway, with name like `${toTemplateName}1` `${toTemplateName}2`
export function copyTemplateAnyway(content: string, fromTemplateName: string, toTemplateName?: string): Templates {
  const resource = Templates.parseText(content);
  const fromTemplate = resource.toArray().find((t) => t.name === fromTemplateName);
  if (!fromTemplate) {
    return resource;
  }

  let newName = toTemplateName;
  if (!newName) {
    const copyName = `${fromTemplate.name}_Copy`;
    newName = increaseNameUtilNotExist(resource.toArray(), copyName);
  }
  const { parameters, body } = fromTemplate;
  return resource.addTemplate(newName, parameters, body);
}

export function removeTemplate(content: string, templateName: string) {
  const resource = Templates.parseText(content);
  return resource.deleteTemplate(templateName);
}

export function removeTemplates(content: string, templateNames: string[]) {
  let resource = Templates.parseText(content);
  templateNames.forEach((templateName) => {
    resource = resource.deleteTemplate(templateName);
  });
  return resource;
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

  templates.forEach((template) => {
    textBuilder.push(`${textFromTemplate(template)}\n`);
  });

  return textBuilder.join('');
}

export function checkSingleLgTemplate(template: LgTemplate) {
  const content = textFromTemplates([template]);

  if (Templates.parseText(content).toArray().length !== 1) {
    throw new Error('Not a single template');
  }
}

export function extractOptionByKey(nameOfKey: string, options: string[]): string {
  let result = '';
  for (const option of options) {
    if (nameOfKey && option.includes('=')) {
      const index = option.indexOf('=');
      const key = option.substring(0, index).trim().toLowerCase();
      const value = option.substring(index + 1).trim();
      if (key === nameOfKey) {
        result = value;
      }
    }
  }
  return result;
}
