// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { ExternalApi } from '../../src/copyUtils/ExternalApi';

export const externalApiStub: ExternalApi = {
  getDesignerId: () => ({ id: '5678' }),
  copyLgTemplate: (lgTemplateName: string, targetNodeId: string) => Promise.resolve(lgTemplateName),
};
