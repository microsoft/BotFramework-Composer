// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Template } from 'botbuilder-lg';

export function normalizeLgTemplate(template: Template): string {
  const templateTexts = template.body.split('\n').map(line => (line.startsWith('-') ? line.substring(1) : line));
  let showText = '';

  if (templateTexts[0] && templateTexts[0].trim() === '[Activity') {
    // TODO: validate enough use cases
    showText = templateTexts;
  } else {
    showText = templateTexts.join('\n');
  }
  return showText;
}
