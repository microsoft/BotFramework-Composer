// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { lgIndexer } from '../src/lgIndexer';
import { FileInfo } from '../src/type';

const { parse, index, check } = lgIndexer;

describe('parse', () => {
  it('should parse lg file', () => {
    const content = `# Exit
-Thanks for using todo bot.

# Greeting
-What's up bro`;
    const templates: any = parse(content);
    expect(templates.length).toEqual(2);
    expect(templates[0].name).toEqual('Exit');
    expect(templates[1].name).toEqual('Greeting');
  });
});

describe('check', () => {
  it('should check lg file and return diagnostics', () => {
    const content = `# Exit
Thanks for using todo bot.

# Greeting
-What's up bro`;
    const diagnostics: any = check(content, 'common');
    expect(diagnostics.length).toEqual(1);
  });
});

describe('index', () => {
  const content = `# Exit
-Thanks for using todo bot.

# Greeting
-What's up bro`;

  const file: FileInfo = {
    name: 'test.lg',
    relativePath: './test.lg',
    content,
    path: '/',
  };
  it('should index lg file', () => {
    const { id, templates, diagnostics }: any = index([file])[0];
    expect(id).toEqual('test');
    expect(templates.length).toEqual(2);
    expect(diagnostics.length).toEqual(0);
    expect(templates[0].name).toEqual('Exit');
    expect(templates[1].name).toEqual('Greeting');
  });
});
