// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import httpClient from '../../../utils/httpUtil';

export async function validateManifestUrl(projectId: string, manifestUrl: string): Promise<string | undefined> {
  // skip validation if there are other local errors.
  if (manifestUrl == null || manifestUrl === '') {
    return;
  }

  try {
    await httpClient.post(`/projects/${projectId}/skill/check`, { url: manifestUrl });
  } catch (err) {
    return err.response?.data.message ?? err;
  }
}
