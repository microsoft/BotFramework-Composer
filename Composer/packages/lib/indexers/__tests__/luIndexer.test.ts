// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { luIndexer } from '../src/luIndexer';
import { FileInfo } from '../src/type';

const { parse, index } = luIndexer;

describe('parse', () => {
  it('should parse lu file', () => {
    const content = `> !# @enableSections = true

# CheckTodo
## CheckUnreadTodo
- check my unread todo
- show my unread todos

@ simple todoTitle

## CheckDeletedTodo
- check my deleted todo
- show my deleted todos

@ simple todoSubject

# Greeting
- hi
- hello

@ simple fooName

`;
    const { intents, diagnostics }: any = parse(content);
    expect(diagnostics.length).toEqual(0);
    expect(intents.length).toEqual(4);
    expect(intents[0].Name).toEqual('CheckTodo');
    expect(intents[1].Name).toEqual('CheckTodo/CheckUnreadTodo');
    expect(intents[2].Name).toEqual('CheckTodo/CheckDeletedTodo');
    expect(intents[3].Name).toEqual('Greeting');
    expect(intents[0].Children.length).toEqual(2);
    expect(intents[0].Children[0].Name).toEqual('CheckUnreadTodo');
    expect(intents[0].Children[0].Entities.length).toEqual(1);
    expect(intents[0].Children[0].Entities[0]).toEqual('todoTitle');
  });

  it('should parse lu file with diagnostic', () => {
    const content = `# Greeting
hi
- hello

@ simple friendsName

`;
    const { intents, diagnostics }: any = parse(content);
    expect(intents.length).toEqual(1);
    expect(diagnostics.length).toEqual(1);
    expect(diagnostics[0].range.start.line).toEqual(2);
    expect(diagnostics[0].range.start.character).toEqual(0);
    expect(diagnostics[0].range.end.line).toEqual(2);
    expect(diagnostics[0].range.end.character).toEqual(2);
  });
});

describe('index', () => {
  const content = `# Greeting
- hi
- hello

@ simple friendsName

`;

  const file: FileInfo = {
    name: 'test.lu',
    relativePath: './test.lu',
    content,
    path: '/',
  };

  it('should index lu file', () => {
    const { id, intents, diagnostics }: any = index([file])[0];
    expect(id).toEqual('test');
    expect(diagnostics.length).toEqual(0);
    expect(intents.length).toEqual(1);
    expect(intents[0].Name).toEqual('Greeting');
    expect(intents[0].Entities.length).toEqual(1);
    expect(intents[0].Entities[0]).toEqual('friendsName');
  });
});
