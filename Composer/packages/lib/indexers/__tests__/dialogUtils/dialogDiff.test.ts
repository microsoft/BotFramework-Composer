// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';

import set from 'lodash/set';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';

import { DialogDiffAdd, DialogDiffUpdate } from '../../src/dialogUtils/dialogDiff';
import { JsonPathStart } from '../../src/dialogUtils/jsonDiff';

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

const baseDialogAdded = adds.reduce((dialog, currentItem) => {
  const { path, value } = currentItem;
  return set(dialog, path, value);
}, cloneDeep(baseDialog));

const baseDialogUpdated = updates.reduce((dialog, currentItem) => {
  const { path, value } = currentItem;
  return set(dialog, path, value);
}, cloneDeep(baseDialog));

const baseDialogInserted = inserts.reduce((dialog, currentItem) => {
  const { path, value } = currentItem;
  const matched = path.match(/(.*)\[(\d+)\]$/);
  if (!matched) throw new Error('insert path must in an array, e.g [1]');
  const [, insertListPath, insertIndex] = matched;
  const insertListValue = get(dialog, insertListPath);
  if (!Array.isArray(insertListValue)) throw new Error('insert target path value is not an array');

  insertListValue.splice(Number(insertIndex), 0, value);
  return set(dialog, insertListPath, insertListValue);
}, cloneDeep(baseDialog));

describe('dialog diff', () => {
  it('inserts', () => {
    const changes = DialogDiffAdd(baseDialog, baseDialogInserted);
    expect(changes.length).toEqual(1);
    // expect(changes[0].path).toEqual([JsonPathStart, adds[0].path].join('.'));
    // expect(changes[0].value).toEqual(changes[0].value);
  });

  it('adds', () => {
    const changes = DialogDiffAdd(baseDialog, baseDialogAdded);
    expect(changes.length).toEqual(1);
    expect(changes[0].path).toEqual([JsonPathStart, adds[0].path].join('.'));
    expect(changes[0].value).toEqual(changes[0].value);
  });

  it('updates', () => {
    const changes = DialogDiffUpdate(baseDialog, baseDialogUpdated);
    expect(changes.length).toEqual(1);
    expect(changes[0].path).toEqual([JsonPathStart, updates[0].path].join('.'));
    expect(changes[0].value).toEqual(changes[0].value);
  });
});
