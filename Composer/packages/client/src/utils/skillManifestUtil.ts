// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const getManifestUrl = (hostname, skillManifest) =>
  `https://${hostname}.azurewebsites.net/manifests/${skillManifest.id}.json`;
