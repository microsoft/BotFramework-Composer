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
    expect(templates[0].range?.start.line).toEqual(1);
    expect(templates[0].range?.end.line).toEqual(3);
    expect(templates[1].name).toEqual('Greeting');
    expect(templates[1].body).toContain(`-What's up bro`);
    expect(templates[1].parameters).toEqual([]);
    expect(templates[1].range?.start.line).toEqual(4);
    expect(templates[1].range?.end.line).toEqual(5);
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

  it('should update lg template with only name', () => {
    const content = `# Exit
-Thanks for using todo bot.

# Greeting
-What's up bro`;

    const lgFile = parse('a.lg', content, []);
    const updatedLgFile = updateTemplate(lgFile, 'Exit', { name: 'Exit1' });
    const templates = Templates.parseText(updatedLgFile.content).toArray();
    expect(templates.length).toEqual(2);
    expect(templates[0].name).toEqual('Exit1');
    expect(templates[0].body).toContain('-Thanks for using todo bot.');
  });

  it('should update lg template with only body', () => {
    const content = `# Exit
-Thanks for using todo bot.

# Greeting
-What's up bro`;

    const lgFile = parse('a.lg', content, []);
    const updatedLgFile = updateTemplate(lgFile, 'Exit', { body: '-Bye' });
    const templates = Templates.parseText(updatedLgFile.content).toArray();
    expect(templates.length).toEqual(2);
    expect(templates[0].name).toEqual('Exit');
    expect(templates[0].body).toEqual('-Bye');
  });

  it('update lg template with empty, should perform a remove', () => {
    const content = `# Exit
-Thanks for using todo bot.

# Greeting
-What's up bro`;

    const lgFile = parse('a.lg', content, []);
    const updatedLgFile = updateTemplate(lgFile, 'Exit', {});
    const templates = Templates.parseText(updatedLgFile.content).toArray();
    expect(templates.length).toEqual(1);
  });

  it('should update lg template with error', () => {
    const content = `# Exit
-Thanks for using todo bot.\${

# Greeting
-What's up bro`;
    const lgFile = parse('a.lg', content, []);

    expect(lgFile.diagnostics.length).toEqual(1);
    expect(lgFile.diagnostics[0].range?.start.line).toEqual(2);
    expect(lgFile.diagnostics[0].range?.end.line).toEqual(2);

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
    expect(diags[0].range?.start.line).toEqual(2);
    expect(diags[0].range?.end.line).toEqual(2);
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

describe('extract lg template details', () => {
  it('should extract normal lg template details', () => {
    const content = `# Exit
-Thanks for using todo bot.`;

    const templates = parse('a.lg', content, []).templates;
    const templateDetails: any = templates[0];

    expect(templates.length).toEqual(1);
    expect(templateDetails.templateType).toEqual('plainText');
    expect(templateDetails.structuredType).toEqual('None');
    expect(templateDetails.speakEnabled).toEqual(false);
    expect(templateDetails.expressionsUsed).toEqual([]);
  });

  it('should extract structured template details of Activity', () => {
    const content = `# Exit
[Activity
  Text = exit
  SuggestedActions = a | b
]`;

    const templates = parse('a.lg', content, []).templates;
    const templateDetails: any = templates[0];

    expect(templates.length).toEqual(1);
    expect(templateDetails.templateType).toEqual('structured');
    expect(templateDetails.structuredType).toEqual('Activity');
    expect(templateDetails.speakEnabled).toEqual(false);
    expect(templateDetails.expressionsUsed).toEqual([]);
  });

  it('should extract structured template details of HeroCard', () => {
    const content = `# Exit
[HeroCard
  Text = exit
  SuggestedActions = a | b
]`;

    const templates = parse('a.lg', content, []).templates;
    const templateDetails: any = templates[0];

    expect(templates.length).toEqual(1);
    expect(templateDetails.templateType).toEqual('structured');
    expect(templateDetails.structuredType).toEqual('HeroCard');
    expect(templateDetails.speakEnabled).toEqual(false);
    expect(templateDetails.expressionsUsed).toEqual([]);
  });

  it('should extract structured template details of Attachment', () => {
    const content = `# Exit
[Attachment
  contenttype = type
  content = content
]`;

    const templates = parse('a.lg', content, []).templates;
    const templateDetails: any = templates[0];

    expect(templates.length).toEqual(1);
    expect(templateDetails.templateType).toEqual('structured');
    expect(templateDetails.structuredType).toEqual('Attachment');
    expect(templateDetails.speakEnabled).toEqual(false);
    expect(templateDetails.expressionsUsed).toEqual([]);
  });

  it('should extract structured template details of CardAction', () => {
    const content = `# Exit
[CardAction
  Type = yyy
  Title = title
  Value = value
  Text = text
]`;

    const templates = parse('a.lg', content, []).templates;
    const templateDetails: any = templates[0];

    expect(templates.length).toEqual(1);
    expect(templateDetails.templateType).toEqual('structured');
    expect(templateDetails.structuredType).toEqual('CardAction');
    expect(templateDetails.speakEnabled).toEqual(false);
    expect(templateDetails.expressionsUsed).toEqual([]);
  });

  it('should extract structured template details with speak enabled', () => {
    const content = `# Exit
[Activity
  Text = exit
  Speak = please exit
  SuggestedActions = a | b
]`;

    const templates = parse('a.lg', content, []).templates;
    const templateDetails: any = templates[0];

    expect(templates.length).toEqual(1);
    expect(templateDetails.templateType).toEqual('structured');
    expect(templateDetails.structuredType).toEqual('Activity');
    expect(templateDetails.speakEnabled).toEqual(true);
    expect(templateDetails.expressionsUsed).toEqual([]);
  });

  it('should extract structured template details of expressions', () => {
    const content = `# Exit
[Activity
  Text = \${add(1+1)}
  Speak = please exit
  SuggestedActions = a | b
]

# Greeting
- IF: \${length(join(foreach(who), ',')) > 0}
  -What's up \${length(who)}
- ELSE:
  -What's up friend

# greetInAWeek
-SWITCH: \${length(day)}
  -CASE: \${concat('Satur', 'day')}
      -Happy Saturday!
  -CASE: \${Sunday}
      -Happy Sunday!
  -DEFAULT:
      -\${json('Work', 'Hard')}!

# cancel
- cancel \${add(1, 2)} tasks`;

    const templates = parse('a.lg', content, []).templates;
    const templateDetails0: any = templates[0];
    const templateDetails1: any = templates[1];
    const templateDetails2: any = templates[2];
    const templateDetails3: any = templates[3];

    expect(templates.length).toEqual(4);
    expect(templateDetails0.expressionsUsed).toEqual(['add']);
    expect(templateDetails1.expressionsUsed).toEqual(['length', 'join', 'foreach', 'length']);
    expect(templateDetails2.expressionsUsed).toEqual(['length', 'concat', 'json']);
    expect(templateDetails3.expressionsUsed).toEqual(['add']);
  });
});
