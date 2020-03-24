// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LGParser } from 'botbuilder-lg';

import { updateTemplate, addTemplate, removeTemplate } from '../src/utils/lgUtil';

describe('update lg template', () => {
  it('should update lg template', () => {
    const content = `# Exit
-Thanks for using todo bot.

# Greeting
-What's up bro`;

    const template = { name: 'Exit', parameters: [], body: '-Bye' };
    const newContent = updateTemplate(content, 'Exit', template);
    const { templates }: any = LGParser.parseText(newContent);
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
    const { templates }: any = LGParser.parseText(newContent);
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
    const { templates }: any = LGParser.parseText(newContent);
    expect(templates.length).toEqual(1);
    expect(templates[0].name).toEqual('Exit');
  });
});
