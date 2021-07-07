# How to connect to a skill

In the Bot Framework Composer, you can "connect to a skill" by providing a manifest file and coreponding dispatch models. 
- The manifest json could be either v2.0 or v2.1 or v2.2. Note: Only v2.2 supports url-reference for dispatch models, https://github.com/microsoft/botframework-sdk/blob/main/schemas/skills/v2.2/skill-manifest.json
- The "connect to a skill" action will be success as long as the manifest file content is valid. If the absolute/relative url is not accessible, you will just get an warning, and you can continue to edit your trigger phrases and add the skill. 

## The manifest file could be provided in two ways

- A http-based manifest url. In the manifest, the url could be an absolute http url, or a relative file path which can be resolved to a http url. 
```
  For example: https://yourazurewebapp.azurewebsites.net/manifests/CoreAssistant-2-1-manifest.json
```
- A .zip file with manifest.json and the dispatch models(.lu .qna...). If it is v2.2. The privacyUrl, the iconUrl and the dispatch models urls can all be relative url within the .zip folder. 
```
  For example: https://github.com/microsoft/botframework-sdk/tree/main/schemas/skills/v2.2/samples/relativeUris
```
