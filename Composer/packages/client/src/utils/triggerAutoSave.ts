// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import httpClient from './httpUtil';

export const triggerAutoSave = async (projectId: string) => {
  if (projectId) {
    const result = await httpClient.put(`/projects/${projectId}/autoSave`);
    if (result.status === 200) {
      // good
    } else {
      // bad
    }
  }
  // no-op if there is no project currently open
};
