// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { ExternalApi } from '../../src/copyUtils/ExternalApi';
import { copySendActivity } from '../../src/copyUtils/copySendActivity';

describe('copySendActivity', () => {
  const externalApi: ExternalApi = {
    getDesignerId: () => ({ id: '5678' }),
    copyLgTemplate: (id, x) => Promise.resolve(x + '(copy)'),
  };

  it('can copy SendActivity', async () => {
    const sendActivity = {
      $type: 'Microsoft.SendActivity',
      activity: '[bfdactivity-1234]',
    };

    expect(await copySendActivity(sendActivity, externalApi)).toEqual({
      $type: 'Microsoft.SendActivity',
      $designer: { id: '5678' },
      activity: '[bfdactivity-1234](copy)',
    });
  });
});
