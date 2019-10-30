// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const TEMPLATE_PATTERN = /^\[bfd(.+)-(\d+)\]$/;
export function isLgTemplate(template: string): boolean {
  return TEMPLATE_PATTERN.test(template);
}

export function parseLgTemplate(template: string) {
  const result = TEMPLATE_PATTERN.exec(template);
  if (result && result.length === 3) {
    return {
      templateType: result[1],
      templateId: result[2],
    };
  }
  return null;
}
