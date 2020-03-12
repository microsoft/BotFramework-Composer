// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { copySendActivity } from '../../src/copyUtils/copySendActivity';
import { ExternalApi } from '../../src/copyUtils/ExternalApi';
import { externalApiStub as externalApi } from '../jestMocks/externalApiStub';

describe('copySendActivity', () => {
  const externalApiWithLgCopy: ExternalApi = {
    ...externalApi,
    copyLgTemplate: (id, data, fieldName, fieldValue) => Promise.resolve(fieldValue + '(copy)'),
  };

  it('can copy SendActivity', async () => {
    const sendActivity = {
      $type: 'Microsoft.SendActivity',
      activity: '[bfdactivity-1234]',
    };

    expect(await copySendActivity(sendActivity, externalApiWithLgCopy)).toEqual({
      $type: 'Microsoft.SendActivity',
      $designer: { id: '5678' },
      activity: '[bfdactivity-1234](copy)',
    });
  });
});
