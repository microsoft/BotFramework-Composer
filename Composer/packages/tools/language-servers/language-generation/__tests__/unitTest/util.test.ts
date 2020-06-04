// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { textFromTemplate, checkTemplate } from '../../src/utils';

describe('LG LSP server util function test', () => {
  it('text from template', function () {
    const template = {
      name: 'Greeting',
      body: '-hi',
    };
    const templateText = textFromTemplate(template);
    expect(templateText).toContain('# Greeting');
  });

  it('check a valid template', function () {
    const template = {
      name: 'Greeting',
      body: '-hi',
    };
    const diags = checkTemplate(template);
    expect(diags).toHaveLength(0);
  });

  it('check an invalid template', function () {
    const template = {
      name: 'Greeting',
      body: 'hi ${ ',
    };
    const diags = checkTemplate(template);
    expect(diags).toHaveLength(1);
  });
});
