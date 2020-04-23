// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';

import set from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';

import { DialogDiffAdd, DialogDiffUpdate } from '../../src/dialogUtils/dialogDiff';
import { JsonPathStart } from '../../src/dialogUtils/jsonDiff';

const baseDialog = JSON.parse(fs.readFileSync(`${__dirname}/data/base.dialog`, 'utf-8'));

const adds = [
  // insert at actions end
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
  // update at middle of intents
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

const baseDialogAdded = adds.reduce((dialog, currentItem) => {
  const { path, value } = currentItem;
  return set(dialog, path, value);
}, cloneDeep(baseDialog));

const baseDialogUpdated = updates.reduce((dialog, currentItem) => {
  const { path, value } = currentItem;
  return set(dialog, path, value);
}, cloneDeep(baseDialog));

describe('dialog diff', () => {
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
