// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import httpClient from './httpUtil';

export const triggerAutoSave = async (projectId: string) => {
  if (projectId) {
    try {
      const result = await httpClient.put(`/projects/${projectId}/autoSave`);
      if (result.status === 200) {
        // good
      } else {
        // bad
      }
    } catch (e) {
      console.error(`Failed to autosave for project ${projectId}: ${e}`);
    }
  }
  // no-op if there is no project currently open
};
