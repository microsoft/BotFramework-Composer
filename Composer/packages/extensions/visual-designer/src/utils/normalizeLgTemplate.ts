// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LGTemplate } from 'botbuilder-lg';

export function normalizeLgTemplate(template: LGTemplate): string {
  const templateTexts = template.body.split('\n').map(line => (line.startsWith('-') ? line.substring(1) : line));
  let showText = '';

  if (templateTexts[0] && templateTexts[0].trim() === '[Activity') {
    showText = templateTexts.find(text => text.includes('Text = '))?.split('Text = ')[1] || '';
  } else {
    showText = templateTexts.join('\n');
  }
  return showText;
}
