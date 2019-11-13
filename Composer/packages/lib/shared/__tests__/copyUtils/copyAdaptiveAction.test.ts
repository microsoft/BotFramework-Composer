// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { copyAdaptiveAction } from '../../src/copyUtils';
import { ExternalApi } from '../../src/copyUtils/ExternalApi';

describe('copyAdaptiveAction', () => {
  const externalApi: ExternalApi = {
    getDesignerId: () => ({ id: '5678' }),
    copyLgTemplate: (id, x) => Promise.resolve(x + '(copy)'),
  };

  it('should return {} when input is invalid', async () => {
    expect(await copyAdaptiveAction(null, externalApi)).toEqual({});
    expect(await copyAdaptiveAction({}, externalApi)).toEqual({});
    expect(await copyAdaptiveAction({ name: 'hi' }, externalApi)).toEqual({});
  });
});
