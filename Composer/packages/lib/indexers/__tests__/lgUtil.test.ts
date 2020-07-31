// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Templates } from 'botbuilder-lg';

import {
  updateTemplate,
  addTemplate,
  checkTemplate,
  removeTemplate,
  extractOptionByKey,
  parse,
} from '../src/utils/lgUtil';

describe('update lg template', () => {
  it('should parse lg file', () => {
    const content = `# Exit
-Thanks for using todo bot.

# Greeting
-What's up bro`;

    const templates = parse('a.lg', content, []).templates;
    expect(templates.length).toEqual(2);
    expect(templates[0].name).toEqual('Exit');
    expect(templates[0].body).toContain('-Thanks for using todo bot.');
    expect(templates[0].parameters).toEqual([]);
    expect(templates[0].range).toEqual({
      startLineNumber: 1,
      endLineNumber: 3,
    });
    expect(templates[1].name).toEqual('Greeting');
    expect(templates[1].body).toContain(`-What's up bro`);
    expect(templates[1].parameters).toEqual([]);
    expect(templates[1].range).toEqual({
      startLineNumber: 4,
      endLineNumber: 5,
    });
  });

  it('should update lg template', () => {
    const content = `# Exit
-Thanks for using todo bot.

# Greeting
-What's up bro`;

    const lgFile = parse('a.lg', content, []);
    const template = { name: 'Exit', parameters: [], body: '-Bye' };
    const updatedLgFile = updateTemplate(lgFile, 'Exit', template);
    const templates = Templates.parseText(updatedLgFile.content).toArray();
    expect(templates.length).toEqual(2);
    expect(templates[0].name).toEqual('Exit');
    expect(templates[0].body).toEqual('-Bye');
  });

  it('should update lg template with error', () => {
    const content = `# Exit
-Thanks for using todo bot.\${

# Greeting
-What's up bro`;
    const lgFile = parse('a.lg', content, []);

    const templates0 = Templates.parseText(content).toArray();
    expect(templates0.length).toEqual(2);
    const template = { name: 'Exit', parameters: [], body: '-Bye' };
    const updatedLgFile = updateTemplate(lgFile, 'Exit', template);
    const templates = Templates.parseText(updatedLgFile.content).toArray();
    expect(templates.length).toEqual(2);
    expect(templates[0].name).toEqual('Exit');
    expect(templates[0].body).toEqual('-Bye');
  });
});

describe('add lg template', () => {
  it('should add lg template', () => {
    const content = `# Exit
-Thanks for using todo bot.

# Greeting
-What's up bro`;
    const lgFile = parse('a.lg', content, []);
    const template = { name: 'Hi', parameters: [], body: '-hello' };
    const updatedLgFile = addTemplate(lgFile, template);
    const templates = Templates.parseText(updatedLgFile.content).toArray();
    expect(templates.length).toEqual(3);
    expect(templates[0].name).toEqual('Exit');
    expect(templates[1].name).toEqual('Greeting');
    expect(templates[2].name).toEqual('Hi');
  });
});

describe('remove lg template', () => {
  it('should remove lg template', () => {
    const content = `# Exit
-Thanks for using todo bot.

# Greeting
-What's up bro`;
    const lgFile = parse('a.lg', content, []);
    const updatedLgFile = removeTemplate(lgFile, 'Greeting');
    const templates = Templates.parseText(updatedLgFile.content).toArray();
    expect(templates.length).toEqual(1);
    expect(templates[0].name).toEqual('Exit');
  });
});

describe('check lg template', () => {
  it('check a valid template', () => {
    const template = {
      name: 'Greeting',
      body: '-hi',
      parameters: [],
    };
    const diags = checkTemplate(template);
    expect(diags).toHaveLength(0);
  });

  it('check an invalid template', () => {
    const template = {
      name: 'Greeting',
      body: 'hi ${ ',
      parameters: [],
    };
    const diags = checkTemplate(template);
    expect(diags).toHaveLength(1);
  });
});

describe('extract option by key', () => {
  it('should extract optin', () => {
    const options = ['@strict = false', '@Namespace = foo', '@Exports = bar, cool'];
    const namespace = extractOptionByKey('@namespace', options);
    expect(namespace).toBe('foo');
    const namespace2 = extractOptionByKey('@wrong', options);
    expect(namespace2).toBe('');
    const strict = extractOptionByKey('@strict', options);
    expect(strict).toBe('false');
  });
});
