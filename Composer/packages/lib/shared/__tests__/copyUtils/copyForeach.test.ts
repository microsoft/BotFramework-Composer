// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { copyForeach } from '../../src/copyUtils/copyForeach';
import { externalApiStub as externalApi } from '../__mocks__/externalApiStub';

describe('#copyForeach', () => {
  it('can copy Foreach action', async () => {
    const foreachInstance = {
      $kind: 'Microsoft.Foreach',
      itemsProperty: 'name',
      actions: [
        {
          $kind: 'Microsoft.SendActivity',
          activity: 'hello',
        },
      ],
    };

    expect(await copyForeach(foreachInstance, externalApi)).toEqual({
      $kind: 'Microsoft.Foreach',
      itemsProperty: 'name',
      $designer: {
        id: '5678',
      },
      actions: [
        {
          $kind: 'Microsoft.SendActivity',
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
      $kind: 'Microsoft.Foreach',
      itemsProperty: 'name',
      pageSize: 10,
      actions: [
        {
          $kind: 'Microsoft.SendActivity',
          activity: 'hello',
        },
      ],
    };

    expect(await copyForeach(foreachPageInstance, externalApi)).toEqual({
      $kind: 'Microsoft.Foreach',
      itemsProperty: 'name',
      pageSize: 10,
      $designer: {
        id: '5678',
      },
      actions: [
        {
          $kind: 'Microsoft.SendActivity',
          $designer: {
            id: '5678',
          },
          activity: 'hello',
        },
      ],
    });
  });
});
