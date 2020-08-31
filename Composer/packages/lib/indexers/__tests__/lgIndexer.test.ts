// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { lgIndexer } from '../src/lgIndexer';
import { FileInfo } from '../src/type';
import { getBaseName } from '../src/utils/help';

const { parse, index } = lgIndexer;

describe('parse', () => {
  it('should parse lg file', () => {
    const content = `# Exit
-Thanks for using todo bot.

# Greeting
-What's up bro`;
    const { templates }: any = parse(content);
    expect(templates.length).toEqual(2);
    expect(templates[0].range.start.line).toEqual(1);
    expect(templates[0].range.end.line).toEqual(3);
    expect(templates[0].parameters).toEqual([]);
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
    const { diagnostics }: any = parse(content, 'common');
    expect(diagnostics.length).toEqual(1);
  });
});

describe('index', () => {
  const content = `[import](../common/common.lg)
# Exit
-Thanks for using todo bot.

# Hi
- @{Greeting1()}
`;

  const file: FileInfo = {
    name: 'test.lg',
    relativePath: './test.lg',
    content,
    path: '/',
  };

  const files = {
    common: {
      id: 'common',
      content: `# Greeting
      -What's up bro`,
    },
  };

  const importResolver = (_source: string, _id: string) => {
    const id = getBaseName(_id.split('/').pop() || '', '.lg');
    return files[id];
  };

  it('should index lg file with [import]', () => {
    const { id, templates, diagnostics }: any = index([file], importResolver)[0];
    expect(id).toEqual('test');
    expect(templates.length).toEqual(2);
    expect(diagnostics.length).toEqual(0);
    expect(templates[0].name).toEqual('Exit');
    expect(templates[1].name).toEqual('Hi');
  });
});
