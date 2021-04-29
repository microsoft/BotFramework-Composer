export const getManifestUrl = (hostname, skillManifest) =>
  `https://${hostname}.azurewebsites.net/manifests/${skillManifest.id}.json`;
