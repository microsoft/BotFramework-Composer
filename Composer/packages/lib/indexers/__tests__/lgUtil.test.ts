// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Templates } from 'botbuilder-lg';

import { updateTemplate, addTemplate, removeTemplate, extractOptionByKey } from '../src/utils/lgUtil';

describe('update lg template', () => {
  it('should update lg template', () => {
    const content = `# Exit
-Thanks for using todo bot.

# Greeting
-What's up bro`;

    const template = { name: 'Exit', parameters: [], body: '-Bye' };
    const newContent = updateTemplate(content, 'Exit', template);
    const templates = Templates.parseText(newContent).toArray();
    expect(templates.length).toEqual(2);
    expect(templates[0].name).toEqual('Exit');
    expect(templates[0].body).toEqual('-Bye');
  });

  it('should update lg template with error', () => {
    const content = `# Exit
-Thanks for using todo bot.\${ 

# Greeting
-What's up bro`;

    const templates0 = Templates.parseText(content).toArray();
    expect(templates0.length).toEqual(2);
    const template = { name: 'Exit', parameters: [], body: '-Bye' };
    const newContent = updateTemplate(content, 'Exit', template);
    const templates = Templates.parseText(newContent).toArray();
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
    const template = { name: 'Hi', parameters: [], body: '-hello' };
    const newContent = addTemplate(content, template);
    const templates = Templates.parseText(newContent).toArray();
    expect(templates.length).toEqual(3);
    expect(templates[0].name).toEqual('Exit');
    expect(templates[1].name).toEqual('Greeting');
    expect(templates[2].name).toEqual('Hi');
  });
});

describe('add lg template', () => {
  it('should add lg template', () => {
    const content = `# Exit
-Thanks for using todo bot.

# Greeting
-What's up bro`;
    const newContent = removeTemplate(content, 'Greeting');
    const templates = Templates.parseText(newContent).toArray();
    expect(templates.length).toEqual(1);
    expect(templates[0].name).toEqual('Exit');
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
