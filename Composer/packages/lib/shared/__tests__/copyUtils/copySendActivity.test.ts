// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { copySendActivity } from '../../src/copyUtils/copySendActivity';
import { ExternalApi } from '../../src/copyUtils/ExternalApi';
import { externalApiStub as externalApi } from '../__mocks__/externalApiStub';

describe('copySendActivity', () => {
  const externalApiWithLgCopy: ExternalApi = {
    ...externalApi,
    copyLgField: (fromId, fromData, toId, toData, fieldName) => fromData[fieldName] + '(copy)',
  };

  it('can copy SendActivity', async () => {
    const sendActivity = {
      $kind: 'Microsoft.SendActivity',
      activity: '[SendActivity_1234]',
    };

    expect(copySendActivity(sendActivity, externalApiWithLgCopy)).toEqual({
      $kind: 'Microsoft.SendActivity',
      $designer: { id: '5678' },
      activity: '[SendActivity_1234](copy)',
    });
  });
});
