// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { isSubdirectory } from '../isSubdirectory';

const testCases = [
  ['/foo/bar', '/foo/bar', false],
  ['/foo/bar', '/bar/foo', false],
  ['/foo/bar', '/foo/bar/../baz', false],
  ['/foo/bar', '/foo/bar/../', false],
  ['/foo/bar', '/foo/bar/baz/../', false],
  ['/foo/bar', '/foo/baz/bar/', false],
  ['/foo/bar', '/foo', false],
  ['/foo/bar', '/', false],

  ['/foo/bar', '/foo/bar/baz', true],
  ['/foo/bar', '/foo/bar/baz/../qux', true],
  ['/foo/bar', '/foo/bar/baz/qux/foo/../../bar', true],
];

if (process.platform === 'win32') {
  testCases.push(['C:\\Foo', 'C:\\Foo\\Bar', true], ['C:\\Foo', 'C:\\Bar', false], ['C:\\Foo', 'D:\\Foo\\Bar', false]);
}

it.each(testCases)('isSubDir(%s, %s) -> %s', (parent, dir, expected) => {
  expect(isSubdirectory(parent as string, dir as string)).toBe(expected);
});
