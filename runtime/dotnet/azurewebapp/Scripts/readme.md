# Publish a bot to Azure using scripts

This article covers instructions to publish a bot to Azure using PowerShell scripts. Make sure you already have required Azure resources provisioned before publishing a bot. For a full documentation on how to manually provision and publish a bot, refer to the `README` file of your bot's project folder, for example, under this directory: `C:\Users\UserName\Documents\Composer\BotName`.

## Prerequisites

- A subscription to [Microsoft Azure](https://azure.microsoft.com/free/).
- [A basic bot built using Composer](https://aka.ms/composer-create-first-bot).
- Latest version of the [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli).
- [Node.js](https://nodejs.org/). Use version 12.13.0 or later.
- PowerShell version 6.0 and later.

## Instructions

Follow these steps to manually publish a bot to Azure:

1. Install the required dependencies.

    bf command

   ```cmd
   npm i -g @microsoft/botframework-cli@next
   ```

   bf plugins

    ```cmd
   bf plugins:install @microsoft/bf-sampler-cli@beta
   ```

2. [Eject your C# runtime](https://aka.ms/composer-customize-action#export-runtime).

3. Save your publishing profile in `json` format (profile.json) and execute the following command:

    ```powershell
    .\Scripts\deploy.ps1 -publishProfilePath <path to your publishing profile>
    ```

4. Alternatively, navigate to your bot runtime's `azurewebapp` folder, for example `C:\user\test\ToDoBot\runtime\azurewebapp` and execute the following command under the `azurewebapp` folder:

    ```powershell
    .\Scripts\deploy.ps1 -name <name of resource group> -hostName <hostname of azure webapp> -luisAuthoringKey <luis authoring key> -qnaSubscriptionKey <qna subscription key> -environment <environment>
    ```

> [!NOTE]
> Make sure you [set the correct subscription](https://docs.microsoft.com/en-us/cli/azure/account?view=azure-cli-latest#az_account_set) when running the scripts to publish your bot. The publishing process will take a couple of minutes to finish.

  The following table lists the parameters of the `deploy.ps1` scripts:

  | Parameter | Required/Optional | Description |
  | ----------|--------------|--------------|
  | name      | Required | The name of your Bot Channels Registration |
  | environment | Required | Environment, e.g. Composer |
  | hostName | Required | The name of your Azure Web App instance |
  | luisAuthoringKey | Optional | The LUIS authoring key value |
  | luisAuthoringRegion | Optional | The LUIS authoring region, this is optional|
  | luisResource | The name of your LUIS prediction resource |
  | qnaSubscriptionKey | Optional | The QnA subscription key |
  | language | Optional | The language of qna & luis, defaults to 'en-us' |
  | botPath |  | The path to your bot assets, defaults to `../../` for ejected runtime |
  | logFile |  | The path to save your log file, defaults to `deploy_log.txt` |
  | runtimeIdentifier |  | runtime identifier of your C# publishing targets, defaults to win-x64, read more in [this doc](https://docs.microsoft.com/en-us/dotnet/core/rid-catalog) |
  | publishProfilePath | Required | The path to the publishing profile (in json format) |

## Refresh your Azure Token

Follow these steps to get a new token if you encounter an error about your access token being expired:

- Open a terminal window.
- Run `az account get-access-token`.
- This will result in a JSON object containing the new `accessToken`, printed to the console.
- Copy the value of the accessToken from the terminal and into the publish `accessToken` field in the profile in Composer.
