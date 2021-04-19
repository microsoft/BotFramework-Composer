// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import httpClient from './httpUtil';

export const createManifestFile = async (projectId: string, name: string, content: string) => {
  const response = await httpClient.post(`/projects/${projectId}/manifest/files`, {
    name,
    content,
  });
  return response.data;
};

export const deleteManifestFile = async (projectId: string, name: string) => {
  await httpClient.delete(`/projects/${projectId}/manifest/files/${name}`);
};

export const updateManifestFile = async (projectId: string, name: string, content: string) => {
  const response = await httpClient.put(`/projects/${projectId}/manifest/files/${name}`, {
    name,
    content,
  });
  return response.data;
};
