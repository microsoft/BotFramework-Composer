// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as crypto from 'crypto';

import { computePropertyItemTree, getAllNodes } from '../fieldToolbarUtils';

(global as any).crypto = {
  getRandomValues: (arr: any[]) => crypto.randomBytes(arr.length),
};

const itemTree = {
  id: 'root',
  name: 'root',
  children: [
    {
      id: '1',
      name: 'dialog',
      children: [
        { id: '4', name: 'value', children: [] },
        { id: '5', name: 'turnCount', children: [] },
      ],
    },
    { id: '2', name: 'user', children: [{ id: '6', name: 'name', children: [] }] },
    {
      id: '3',
      name: 'this',
      children: [{ id: '7', name: 'value', children: [{ id: '8', name: 'foo', children: [] }] }],
    },
  ],
};

describe('lgUtils', () => {
  it('computePropertyItemTree: should return item tree', () => {
    const computedItemTree = computePropertyItemTree(['dialog.turnCount', 'dialog.value', 'user.name', 'this.value']);
    expect(computedItemTree).toEqual(
      expect.objectContaining({
        id: 'root',
        name: 'root',
        children: expect.arrayContaining([
          expect.objectContaining({
            name: 'dialog',
            children: expect.arrayContaining([
              expect.objectContaining({ name: 'turnCount' }),
              expect.objectContaining({ name: 'value' }),
            ]),
          }),
          expect.objectContaining({
            name: 'user',
            children: expect.arrayContaining([expect.objectContaining({ name: 'name' })]),
          }),
          expect.objectContaining({
            name: 'this',
            children: expect.arrayContaining([expect.objectContaining({ name: 'value' })]),
          }),
        ]),
      })
    );
  });
});

it('getAllNodes: should return levels', () => {
  const { nodes } = getAllNodes(itemTree);

  expect(nodes).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: 'root', name: 'root' }),
      expect.objectContaining({
        id: '1',
        name: 'dialog',
        children: expect.arrayContaining([
          expect.objectContaining({ id: '4', name: 'value' }),
          expect.objectContaining({ id: '5', name: 'turnCount' }),
        ]),
      }),
      expect.objectContaining({
        id: '2',
        name: 'user',
        children: expect.arrayContaining([expect.objectContaining({ id: '6', name: 'name' })]),
      }),
      expect.objectContaining({
        id: '3',
        name: 'this',
        children: expect.arrayContaining([
          expect.objectContaining({
            id: '7',
            name: 'value',
            children: expect.arrayContaining([expect.objectContaining({ id: '8', name: 'foo' })]),
          }),
        ]),
      }),
      expect.objectContaining({ id: '4', name: 'value' }),
      expect.objectContaining({ id: '5', name: 'turnCount' }),
      expect.objectContaining({ id: '6', name: 'name' }),
      expect.objectContaining({
        id: '7',
        name: 'value',
        children: expect.arrayContaining([expect.objectContaining({ id: '8', name: 'foo' })]),
      }),
      expect.objectContaining({ id: '8', name: 'foo' }),
    ])
  );
});

it('getAllNodes: should return node paths by id', () => {
  const { paths } = getAllNodes(itemTree);
  expect(paths).toEqual({
    '1': 'dialog',
    '2': 'user',
    '3': 'this',
    '4': 'dialog.value',
    '5': 'dialog.turnCount',
    '6': 'user.name',
    '7': 'this.value',
    '8': 'this.value.foo',
    root: 'root',
  });
});

it('getAllNodes: should return node levels by id', () => {
  const { levels } = getAllNodes(itemTree);
  expect(levels).toEqual({
    '1': 1,
    '2': 1,
    '3': 1,
    '4': 2,
    '5': 2,
    '6': 2,
    '7': 2,
    '8': 3,
    root: 0,
  });
});
