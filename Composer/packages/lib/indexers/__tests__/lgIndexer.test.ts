// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo, lgImportResolverGenerator, ResolverResource } from '@bfc/shared';

import { lgIndexer } from '../src/lgIndexer';

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
    lastModified: '',
  };

  const files = [
    {
      id: 'common',
      content: `# Greeting
      -What's up bro`,
    },
  ] as ResolverResource[];

  const importresolver = lgImportResolverGenerator(files, '.lg');

  it('should index lg file with [import]', () => {
    const { id, templates, diagnostics, imports }: any = index([file], importresolver)[0];
    expect(id).toEqual('test');
    expect(templates.length).toEqual(2);
    expect(diagnostics.length).toEqual(0);
    expect(templates[0].name).toEqual('Exit');
    expect(templates[1].name).toEqual('Hi');
    expect(imports.length).toEqual(1);
    expect(imports[0]).toEqual({ id: 'common.lg', path: '../common/common.lg', description: 'import' });
  });
});
