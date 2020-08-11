// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { ExternalApi } from '../../src/copyUtils/ExternalApi';

export const externalApiStub: ExternalApi = {
  getDesignerId: () => ({ id: '5678' }),
  copyLgField: (fromId, fromData, toId, toData, fieldName) => fromData[fieldName] || '',
  copyLuField: (fromId, fromData, toId, toData, fieldName) => fromData[fieldName] || '',
};
