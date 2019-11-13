// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { copyForeach } from '../../src/copyUtils/copyForeach';

import { externalApiStub as externalApi } from './externalApiStub';

describe('#copyForeach', () => {
  it('can copy Foreach action', async () => {
    const foreachInstance = {
      $type: 'Microsoft.Foreach',
      itemsProperty: 'name',
      actions: [
        {
          $type: 'Microsoft.SendActivity',
          activity: 'hello',
        },
      ],
    };

    expect(await copyForeach(foreachInstance, externalApi)).toEqual({
      $type: 'Microsoft.Foreach',
      itemsProperty: 'name',
      $designer: {
        id: '5678',
      },
      actions: [
        {
          $type: 'Microsoft.SendActivity',
          $designer: {
            id: '5678',
          },
          activity: 'hello',
        },
      ],
    });
  });

  it('can copy ForeachPage action', async () => {
    const foreachPageInstance = {
      $type: 'Microsoft.Foreach',
      itemsProperty: 'name',
      pageSize: 10,
      actions: [
        {
          $type: 'Microsoft.SendActivity',
          activity: 'hello',
        },
      ],
    };

    expect(await copyForeach(foreachPageInstance, externalApi)).toEqual({
      $type: 'Microsoft.Foreach',
      itemsProperty: 'name',
      pageSize: 10,
      $designer: {
        id: '5678',
      },
      actions: [
        {
          $type: 'Microsoft.SendActivity',
          $designer: {
            id: '5678',
          },
          activity: 'hello',
        },
      ],
    });
  });
});
