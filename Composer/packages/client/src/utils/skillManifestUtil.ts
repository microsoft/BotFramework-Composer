// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const getManifestUrl = (hostname, skillManifest) =>
  `https://${hostname}.azurewebsites.net/manifests/${skillManifest.id}.json`;

export const skillNameRegex = /[^a-zA-Z0-9-_ ]+/g;
