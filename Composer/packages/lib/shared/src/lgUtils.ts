// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const TEMPLATE_PATTERN = /^\[(bfd(.+)-(\d+))\]$/;
export function isLgTemplateString(template: string): boolean {
  return TEMPLATE_PATTERN.test(template);
}

export function parseLgTemplateString(templateStr: string) {
  const result = TEMPLATE_PATTERN.exec(templateStr);
  if (result && result.length === 4) {
    return {
      lgId: result[1],
      templateType: result[2],
      templateId: result[3],
    };
  }
  return null;
}

export function buildLgId(templateId: string, templateType = 'activity'): string {
  const lgId = `bfd${templateType}-${templateId}`;
  return lgId;
}

export function toLgTemplateString(lgId: string): string {
  return `[${lgId}]`;
}
