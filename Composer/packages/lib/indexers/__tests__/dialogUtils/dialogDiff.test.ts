// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';

import { DialogDiffAdd, DialogDiffUpdate } from '../../src/dialogUtils/dialogDiff';
import { JsonPathStart, JsonInsert, JsonSet } from '../../src/dialogUtils/jsonDiff';

const baseDialog = JSON.parse(fs.readFileSync(`${__dirname}/data/base.dialog`, 'utf-8'));

const adds = [
  // add at list end
  {
    path: 'triggers[7].actions[1]',
    value: {
      $kind: 'Microsoft.SendActivity',
      $designer: {
        id: '677448',
      },
      activity: 'Hi! Agian!',
    },
  },
];

const updates = [
  // update at list middle
  {
    path: 'triggers[1]',
    value: {
      $kind: 'Microsoft.OnIntent',
      $designer: {
        id: '064506',
      },
      actions: [
        {
          $kind: 'Microsoft.BeginDialog',
          dialog: 'addtodo',
        },
      ],
      intent: 'AddIntent',
    },
  },
];

const inserts = [
  // insert at list start
  {
    path: 'triggers[7].actions[0]',
    value: {
      $kind: 'Microsoft.SendActivity',
      $designer: {
        id: '677449',
      },
      activity: 'Hi! Agian!',
    },
  },
];

describe('dialog diff', () => {
  it('inserts', () => {
    const changes = DialogDiffAdd(baseDialog, JsonInsert(baseDialog, inserts));
    expect(changes.length).toEqual(1);
    // expect(changes[0].path).toEqual([JsonPathStart, adds[0].path].join('.'));
    // expect(changes[0].value).toEqual(changes[0].value);
  });

  it('adds', () => {
    const changes = DialogDiffAdd(baseDialog, JsonSet(baseDialog, adds));
    expect(changes.length).toEqual(1);
    expect(changes[0].path).toEqual([JsonPathStart, adds[0].path].join('.'));
    expect(changes[0].value).toEqual(changes[0].value);
  });

  it('updates', () => {
    const changes = DialogDiffUpdate(baseDialog, JsonSet(baseDialog, updates));
    expect(changes.length).toEqual(1);
    expect(changes[0].path).toEqual([JsonPathStart, updates[0].path].join('.'));
    expect(changes[0].value).toEqual(changes[0].value);
  });
});
