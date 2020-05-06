// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';

import get from 'lodash/get';

import { DialogDiff } from '../../src/dialogUtils/dialogDiff';
import { JsonInsert, JsonSet } from '../../src/dialogUtils/jsonDiff';

const baseDialog = JSON.parse(fs.readFileSync(`${__dirname}/data/base.dialog`, 'utf-8'));

describe('dialog diff', () => {
  it('check action adds', () => {
    const inserts1 = [
      // insert at list start
      {
        path: 'triggers[0].actions[0]',
        value: {
          $kind: 'Microsoft.SendActivity',
          $designer: {
            id: '677449',
          },
          activity: 'Hi! Agian!',
        },
      },
    ];

    const dialog1 = JsonInsert(baseDialog, inserts1);
    const changes1 = DialogDiff(baseDialog, dialog1);
    expect(changes1.adds.length).toEqual(1);
    expect(changes1.deletes.length).toEqual(0);
    expect(changes1.updates.length).toEqual(0);
    expect(changes1.adds[0].path).toEqual(`$.${inserts1[0].path}`);
    expect(changes1.adds[0].value).toEqual(inserts1[0].value);

    // delete
    const changes11 = DialogDiff(dialog1, baseDialog);
    expect(changes11.deletes.length).toEqual(1);
    expect(changes11.adds.length).toEqual(0);
    expect(changes11.updates.length).toEqual(0);
    expect(changes11.deletes[0].path).toEqual(`$.${inserts1[0].path}`);
    expect(changes11.deletes[0].value).toEqual(inserts1[0].value);

    const inserts2 = [
      // insert at list end
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

    const dialog2 = JsonInsert(baseDialog, inserts2);
    const changes2 = DialogDiff(baseDialog, dialog2);
    expect(changes2.adds.length).toEqual(1);
    expect(changes2.deletes.length).toEqual(0);
    expect(changes2.updates.length).toEqual(0);
    expect(changes2.adds[0].path).toEqual(`$.${inserts2[0].path}`);
    expect(changes2.adds[0].value).toEqual(inserts2[0].value);

    const inserts3 = [
      // insert at list middle
      {
        path: 'triggers[5].actions[1]',
        value: {
          $kind: 'Microsoft.SendActivity',
          $designer: {
            id: '677445',
          },
          activity: 'Hi 5',
        },
      },
      // insert at list start
      {
        path: 'triggers[7].actions[0]',
        value: {
          $kind: 'Microsoft.SendActivity',
          $designer: {
            id: '677440',
          },
          activity: 'Hi! Agian!',
        },
      },
    ];

    const dialog3 = JsonInsert(baseDialog, inserts3);
    const changes3 = DialogDiff(baseDialog, dialog3);
    expect(changes3.adds.length).toEqual(2);
    expect(changes3.deletes.length).toEqual(0);
    expect(changes3.updates.length).toEqual(0);
    expect(changes3.adds[0].path).toEqual(`$.${inserts3[0].path}`);
    expect(changes3.adds[0].value).toEqual(inserts3[0].value);
    expect(changes3.adds[1].path).toEqual(`$.${inserts3[1].path}`);
    expect(changes3.adds[1].value).toEqual(inserts3[1].value);
  });

  it('check action deletes', () => {
    const inserts4 = [
      // delete at list middle
      {
        path: 'triggers[5].actions[1]',
        value: {
          $kind: 'Microsoft.SendActivity',
          $designer: {
            id: '677445',
          },
          activity: 'Hi 5',
        },
      },
    ];

    const dialog4 = JsonInsert(baseDialog, inserts4);
    const changes4 = DialogDiff(dialog4, baseDialog); // reverse compaire args position, make add to delete.
    expect(changes4.adds.length).toEqual(0);
    expect(changes4.deletes.length).toEqual(1);
    expect(changes4.updates.length).toEqual(0);
    expect(changes4.deletes[0].path).toEqual(`$.${inserts4[0].path}`);
    expect(changes4.deletes[0].value).toEqual(inserts4[0].value);
  });

  it('check action updates', () => {
    const inserts1 = [
      {
        path: 'triggers[7].actions[0].activity',
        value: 'Hi!',
      },
    ];
    const dialog1 = JsonSet(baseDialog, inserts1);
    const changes1 = DialogDiff(baseDialog, dialog1);
    expect(changes1.adds.length).toEqual(0);
    expect(changes1.deletes.length).toEqual(0);
    expect(changes1.updates.length).toEqual(1);
    expect(changes1.updates[0].path).toEqual(`$.${inserts1[0].path}`);
    expect(changes1.updates[0].value).toEqual(inserts1[0].value);
    expect(changes1.updates[0].preValue).toEqual(get(baseDialog, inserts1[0].path));
  });

  it('check trigger adds', () => {
    const inserts1 = [
      // insert at list start
      {
        path: 'triggers[8]',
        value: {
          $kind: 'Microsoft.OnIntent',
          $designer: {
            id: 'X-Xce_',
          },
          intent: 'FooIntent',
        },
      },
    ];

    const dialog1 = JsonInsert(baseDialog, inserts1);
    const changes1 = DialogDiff(baseDialog, dialog1);
    expect(changes1.adds.length).toEqual(1);
    expect(changes1.deletes.length).toEqual(0);
    expect(changes1.updates.length).toEqual(0);
    expect(changes1.adds[0].path).toEqual(`$.${inserts1[0].path}`);
    expect(changes1.adds[0].value).toEqual(inserts1[0].value);
  });

  it('check trigger deletes', () => {
    const inserts1 = [
      // insert at list start
      {
        path: 'triggers[8]',
        value: {
          $kind: 'Microsoft.OnIntent',
          $designer: {
            id: 'X-Xce_',
          },
          intent: 'FooIntent',
        },
      },
    ];

    const dialog1 = JsonInsert(baseDialog, inserts1);
    const changes1 = DialogDiff(dialog1, baseDialog);
    expect(changes1.deletes.length).toEqual(1);
    expect(changes1.adds.length).toEqual(0);
    expect(changes1.updates.length).toEqual(0);
    expect(changes1.deletes[0].path).toEqual(`$.${inserts1[0].path}`);
    expect(changes1.deletes[0].value).toEqual(inserts1[0].value);
  });
});
