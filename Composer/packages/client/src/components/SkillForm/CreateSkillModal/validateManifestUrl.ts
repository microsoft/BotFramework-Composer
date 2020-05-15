// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import httpClient from '../../../utils/httpUtil';

export async function validateManifestUrl(projectId: string, manifestUrl: any): Promise<string | undefined> {
  // skip validation if has local other errors.
  if (!manifestUrl) {
    return;
  }

  try {
    await httpClient.post(`/projects/${projectId}/skill/check`, { url: manifestUrl });
  } catch (err) {
    return err.response && err.response.data.message ? err.response.data.message : err;
  }
}
