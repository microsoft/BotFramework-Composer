// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';

import set from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';

import { DialogDiff } from '../../src/dialogUtils/dialogDiff';
import { JsonPathStart } from '../../src/dialogUtils/jsonDiff';

const baseDialog = JSON.parse(fs.readFileSync(`${__dirname}/data/base.dialog`, 'utf-8'));

const adds = [
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

const baseDialogAdd = adds.reduce((dialog, currentItem) => {
  const { path, value } = currentItem;
  return set(dialog, path, value);
}, cloneDeep(baseDialog));

describe('dialog diff', () => {
  it('get dialog changes path & value', () => {
    const changes = DialogDiff(baseDialog, baseDialogAdd);
    expect(changes.adds.length).toEqual(1);
    expect(changes.adds[0].path).toEqual([JsonPathStart, adds[0].path].join('.'));
    expect(changes.adds[0].value).toEqual(adds[0].value);
    expect(changes.deletes.length).toEqual(0);
    // expect(changes.updates.length).toEqual(0);
  });
});
