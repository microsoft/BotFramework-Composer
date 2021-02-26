# Localization

## Localization within Composer

Composer provides 2 main localization points:

- [formatMessage](https://www.npmjs.com/package/format-message) is used throughout the Composer code to indicate the UI strings that should be localized.
  - The UI strings in the code are extracted to en-US.json files as part of the `l10n` build step.
  - After the OneLocBuild localization build process is completed, the `Composer\packages\server\src\locales\` and `Composer\packages\electron-server\locales\en-US.json` folders will contain the localized files.
- SDK schemas and UI schemas in the `Composer\packages\server\schemas` folder are also localized.

## Localization via OneLocBuild

The translation of english files into their localized equivalents is done by the [OneLocBuild](http://aka.ms/onelocbuild) internal Azure service. This requires an AzureDevOps build pipeline to run. You can all the details about how this pipeline was created [here](https://fuselabs.visualstudio.com/_git/Composer?path=%2FLocalize%2FREADME.md&_a=preview).

## Process for shipping with localized strings

This is the process for ensuring the strings are localized before release:

1. When the Composer GitHub code is ready with all the english default strings checked in, queue a build for the [Localization pipeline](https://fuselabs.visualstudio.com/Composer/_build?definitionId=1157)
2. When the build succeeds, there will be PR in GitHub to complete to check in the updated strings.
3. The build also sends new strings to the OneLocBuild team for translation. They should be informed there are new strings for human translation. Their SLA is T-5 days from release. Our current contact is Stephen Wu <Stephen.Wu@microsoft.com>.
4. Once the translated strings are handled by OneLocBuild, queue another build of the Localization pipeline and complete the PR in GitHub. This will check in the final translations.
