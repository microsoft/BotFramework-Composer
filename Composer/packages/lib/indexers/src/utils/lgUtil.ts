// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * lgUtil.ts is a single place use lg-parser handle lg file operation.
 * it's designed have no state, input text file, output text file.
 *
 */

import { Templates, Diagnostic as LGDiagnostic, ImportResolverDelegate } from 'botbuilder-lg';
import { LgTemplate, importResolverGenerator, TextFile, Diagnostic, Position, Range, LgFile } from '@bfc/shared';
import get from 'lodash/get';
import formatMessage from 'format-message';

import { lgIndexer } from '../lgIndexer';

export interface Template {
  name: string;
  parameters?: string[];
  body: string;
}

// NOTE: LGDiagnostic is defined in PascalCase which should be corrected
function convertLGDiagnostic(d: LGDiagnostic, source: string): Diagnostic {
  const result = new Diagnostic(d.message, source, d.severity);

  const start: Position = new Position(d.range.start.line, d.range.start.character);
  const end: Position = new Position(d.range.end.line, d.range.end.character);
  result.range = new Range(start, end);

  return result;
}

export function convertTemplatesToLgFile(id = '', content: string, templates: Templates): LgFile {
  const used = templates.toArray().map((t) => {
    return {
      name: t.name,
      body: t.body,
      parameters: t.parameters,
      range: {
        startLineNumber: get(t, 'sourceRange.range.start.line', 0),
        endLineNumber: get(t, 'sourceRange.range.end.line', 0),
      },
    };
  });
  const diagnostics = templates.diagnostics.map((d: LGDiagnostic) => {
    return convertLGDiagnostic(d, id);
  });

  return { id, content, templates: used, diagnostics, options: templates.options };
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
  lgFile: LgFile,
  templateName: string,
  { name, parameters, body }: { name?: string; parameters?: string[]; body?: string },
  importResolver?: ImportResolverDelegate
): LgFile {
  const { id, content } = lgFile;
  const resource = Templates.parseText(content, undefined, importResolver);
  const originTemplate = resource.toArray().find((t) => t.name === templateName);
  let templates;
  // add if not exist
  if (!originTemplate) {
    templates = resource.addTemplate(templateName, parameters || [], body || '');
  } else {
    templates = resource.updateTemplate(
      templateName,
      name || originTemplate.name,
      parameters || originTemplate.parameters,
      body || originTemplate.body
    );
  }

  return convertTemplatesToLgFile(id, templates.toString(), templates);
}

// if name exist, throw error.
export function addTemplate(
  lgFile: LgFile,
  { name, parameters = [], body }: LgTemplate,
  importResolver?: ImportResolverDelegate
): LgFile {
  const { id, content } = lgFile;
  const resource = Templates.parseText(content, undefined, importResolver);
  const templates = resource.addTemplate(name, parameters, body);
  return convertTemplatesToLgFile(id, templates.toString(), templates);
}

export function addTemplates(lgFile: LgFile, templates: LgTemplate[], importResolver?: ImportResolverDelegate): LgFile {
  const { id, content } = lgFile;
  const resource = Templates.parseText(content, undefined, importResolver);
  for (const { name, parameters = [], body } of templates) {
    resource.addTemplate(name, parameters, body);
  }
  return convertTemplatesToLgFile(id, resource.toString(), resource);
}

// if name exist, add it anyway, with name like `${name}1` `${name}2`
export function addTemplateAnyway(
  lgFile: LgFile,
  { name = 'TemplateName', parameters = [], body = '-TemplateBody' }: LgTemplate,
  importResolver?: ImportResolverDelegate
): LgFile {
  const { id, content } = lgFile;
  const resource = Templates.parseText(content, undefined, importResolver);
  const newName = increaseNameUtilNotExist(resource.toArray(), name);

  const templates = resource.addTemplate(newName, parameters, body);
  return convertTemplatesToLgFile(id, templates.toString(), templates);
}

// if toTemplateName exist, throw error.
export function copyTemplate(
  lgFile: LgFile,
  fromTemplateName: string,
  toTemplateName: string,
  importResolver?: ImportResolverDelegate
): LgFile {
  const { id, content } = lgFile;
  const resource = Templates.parseText(content, undefined, importResolver);
  const fromTemplate = resource.toArray().find((t) => t.name === fromTemplateName);
  if (!fromTemplate) {
    throw new Error(formatMessage('fromTemplateName does not exist'));
  }
  const { parameters, body } = fromTemplate;
  const templates = resource.addTemplate(toTemplateName, parameters, body);
  return convertTemplatesToLgFile(id, templates.toString(), templates);
}

// if toTemplateName exist, add it anyway, with name like `${toTemplateName}1` `${toTemplateName}2`
export function copyTemplateAnyway(
  lgFile: LgFile,
  fromTemplateName: string,
  toTemplateName?: string,
  importResolver?: ImportResolverDelegate
): LgFile {
  const { id, content } = lgFile;
  const resource = Templates.parseText(content, undefined, importResolver);
  const fromTemplate = resource.toArray().find((t) => t.name === fromTemplateName);
  if (!fromTemplate) {
    return convertTemplatesToLgFile(id, resource.toString(), resource);
  }

  let newName = toTemplateName;
  if (!newName) {
    const copyName = formatMessage(`{name}_Copy`, { name: fromTemplate.name });
    newName = increaseNameUtilNotExist(resource.toArray(), copyName);
  }
  const { parameters, body } = fromTemplate;
  const templates = resource.addTemplate(newName, parameters, body);
  return convertTemplatesToLgFile(id, templates.toString(), templates);
}

export function removeTemplate(lgFile: LgFile, templateName: string, importResolver?: ImportResolverDelegate): LgFile {
  const { id, content } = lgFile;
  const resource = Templates.parseText(content, undefined, importResolver);
  const templates = resource.deleteTemplate(templateName);
  return convertTemplatesToLgFile(id, templates.toString(), templates);
}

export function removeTemplates(
  lgFile: LgFile,
  templateNames: string[],
  importResolver?: ImportResolverDelegate
): LgFile {
  const { id, content } = lgFile;
  let resource = Templates.parseText(content, undefined, importResolver);
  templateNames.forEach((templateName) => {
    resource = resource.deleteTemplate(templateName);
  });
  return convertTemplatesToLgFile(id, resource.toString(), resource);
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
    throw new Error(formatMessage('Not a single template'));
  }
}

export function checkTemplate(template: LgTemplate): LGDiagnostic[] {
  const text = textFromTemplate(template);
  return Templates.parseText(text, '').diagnostics;
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

export function parse(id: string, content: string, lgFiles: TextFile[]): LgFile {
  const lgImportResolver = importResolverGenerator(lgFiles, '.lg');

  const { templates, diagnostics } = lgIndexer.parse(content, id, lgImportResolver);
  return { id, content, templates, diagnostics } as LgFile;
}
