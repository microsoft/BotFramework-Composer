# How to connect to a skill

In Bot framework composer, you can "connect to a skill" by providing a http-based manifest URL or a local compressed (.zip) file.

- The http-based manifest URL should be accessible and a valid manifest JSON file. Otherwise, "connect to a skill" will be failed.
- The local compressed file should include one and only one valid manifest JSON file and corresponding language file if needed.

For manifest version, Composer support manifest v2.0, v2.1 and v2.2.
- Manifest v2.0
- Manifest v2.1 - support dispatch modal
- Manifest v2.2 - support uri-reference in privacyUrl, iconUrl and language dispatch modal

Examples:
1. A http-based manifest url
```
  https://github.com/microsoft/botframework-sdk/blob/main/schemas/skills/v2.1/samples/complex-skillmanifest.json
```

2. A .zip file (Download all the folders and files under relativeUris and zip it)
```
  https://github.com/microsoft/botframework-sdk/tree/main/schemas/skills/v2.2/samples/relativeUris
```



