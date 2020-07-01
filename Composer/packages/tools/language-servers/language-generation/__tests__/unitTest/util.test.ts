// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { textFromTemplate, checkTemplate, updateTemplate } from '../../src/utils';

describe('LG LSP server util function test', () => {
  it('text from template', () => {
    const template = {
      name: 'Greeting',
      body: '-hi',
    };
    const templateText = textFromTemplate(template);
    expect(templateText).toContain('# Greeting');
  });

  it('check a valid template', () => {
    const template = {
      name: 'Greeting',
      body: '-hi',
    };
    const diags = checkTemplate(template);
    expect(diags).toHaveLength(0);
  });

  it('check an invalid template', () => {
    const template = {
      name: 'Greeting',
      body: 'hi ${ ',
    };
    const diags = checkTemplate(template);
    expect(diags).toHaveLength(1);
  });

  it('update template', () => {
    const content = `
# Greeting
- hello
    `;
    const newContent = updateTemplate(content, 'Greeting', '- hi');
    expect(newContent).toContain('- hi');
  });
});
