# How to manually provision Azure resources for your Composer project

This article covers script-based instructions to manually provision resources for use with Composer.
This is an alternative to using the in-app provisioning tool.

## Prerequisites

- A subscription to [Microsoft Azure](https://azure.microsoft.com/free/).
- [A basic bot built using Composer](https://aka.ms/composer-create-first-bot).
- Latest version of the [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli).
- [Node.js](https://nodejs.org/). Use version 12.13.0 or later.
- PowerShell version 6.0 and later.

## Provision Azure resources

Follow these instructions to manually provision Azure resources:

1. Download and unzip the [provisioning helper scripts.](provisionScripts.zip)
2. Open a new Command Prompt and navigate to the newly created folder. For example:

   ```cmd
   cd provisionScripts/
   ```

2. Run the following command to install the dependencies:

   ```cmd
   npm install
   ```

3. Run the following command to provision new Azure resources.

   - **_Azure Web App_**:

   ```cmd
   node provisionComposer.js --subscriptionId=<YOUR AZURE SUBSCRIPTION ID> --name=<NAME OF YOUR RESOURCE GROUP> --appPassword=<APP PASSWORD> --environment=<NAME FOR ENVIRONMENT DEFAULT to dev>
   ```

   - **_Azure Functions_**:

   ```cmd
   node provisionComposer.js --subscriptionId=<YOUR AZURE SUBSCRIPTION ID> --name=<NAME OF YOUR RESOURCE GROUP> --appPassword=<APP PASSWORD> --environment=<NAME FOR ENVIRONMENT DEFAULT to dev> --customArmTemplate=DeploymentTemplates/function-template-with-preexisting-rg.json
   ```

   | Property                    | Description                                                                             |
   | --------------------------- | --------------------------------------------------------------------------------------- |
   | Your Azure Subscription ID  | Find it in your Azure resource in the **Subscription ID** field.                        |
   | Name of your resource group | The name you give to the resource group you are creating.                               |
   | App password                | At least 16 characters with at least one number, one letter, and one special character. |
   | Name for environment        | The name you give to the publish environment.                                           |

   Once completed, the provision scripts will create the following resources in the Azure portal:

   | Resource                                      | Required/Optional |
   | --------------------------------------------- | ----------------- |
   | App Service plan                              | Required          |
   | App Service                                   | Required          |
   | Application Registration                      | Required          |
   | Azure Cosmos DB                               | Optional          |
   | Application Insights                          | Optional          |
   | Azure Blob Storage                            | Optional          |
   | LUIS authoring resource (Cognitive Services)  | Optional          |
   | LUIS prediction resource (Cognitive Services) | Optional          |
   | QnA Maker resources (Cognitive Services)      | Optional          |

   > [!TIP]
   > Read the [parameters list](#provision-scripts-parameters-list) to customize the provision scripts and create the Azure resources you want.

   1. You will be asked to login to the Azure portal in your browser.

   2. If you see the error message "InsufficientQuota", add a param '--createLuisAuthoringResource false' and run the script again.

      - **_Azure Web App_**:

      ```cmd
      node provisionComposer.js --subscriptionId=<YOUR AZURE SUBSCRIPTION ID> --name=<NAME OF YOUR RESOURCE GROUP>--appPassword=<APP PASSWORD> --environment=<NAME FOR ENVIRONMENT DEFAULT to dev> --createLuisAuthoringResource false
      ```

      - **_Azure Functions_**:

      ```cmd
      node provisionComposer.js --subscriptionId=<YOUR AZURE SUBSCRIPTION ID> --name=<NAME OF YOUR RESOURCE GROUP> --appPassword=<APP PASSWORD> --environment=<NAME FOR ENVIRONMENT DEFAULT to dev> --createLuisAuthoringResource false --customArmTemplate=DeploymentTemplates/function-template-with-preexisting-rg.json
      ```

      > [!NOTE]
      > If you use `--createLuisAuthoringResource false` in this step, you should manually add the LUIS authoring key to the publish configuration. The default region is `westus`. To provision to other regions, you should add `--location region`.

4. As the Azure resources are being provisioned, you will see a spinning activity indicator for a few minutes.

   Once completed, you will see the generated JSON appears in the command line like the following. The JSON output is the publishing profile, which will be used in step 5.

   ```json
   {
     "accessToken": "<SOME VALUE>",
     "name": "<NAME OF YOUR RESOURCE GROUP>",
     "environment": "<ENVIRONMENT>",
     "hostname": "<NAME OF THE HOST>",
     "luisResource": "<NAME OF YOUR LUIS RESOURCE>",
     "settings": {
       "applicationInsights": {
         "InstrumentationKey": "<SOME VALUE>"
       },
       "cosmosDb": {
         "cosmosDBEndpoint": "<SOME VALUE>",
         "authKey": "<SOME VALUE>",
         "databaseId": "botstate-db",
         "collectionId": "botstate-collection",
         "containerId": "botstate-container"
       },
       "blobStorage": {
         "connectionString": "<SOME VALUE>",
         "container": "transcripts"
       },
       "luis": {
         "endpointKey": "<SOME VALUE>",
         "authoringKey": "<SOME VALUE>",
         "region": "westus"
       },
       "qna": {
         "endpoint": "<SOME VALUE>",
         "subscriptionKey": "<SOME VALUE>"
       },
       "MicrosoftAppId": "<SOME VALUE>",
       "MicrosoftAppPassword": "<SOME VALUE>"
     }
   }
   ```

5. From the "Publish" tab of Composer, choose to import an existing publishing profile. Paste the JSON from step 4 into Composer and save the profile.

### Provision scripts parameters list

You don't need to create a complete list of the Azure resources as covered in **step 3** of the [provision Azure resources](#provision-azure-resources) section. The following is a table of the parameters you can use to customize the provision scripts so that you only provision the resources needed.

| Parameter                   | Required/Optional | Default value                                            | Description                                                                                                                                                                          |
| --------------------------- | ----------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| subscriptionId              | Required          | N/A                                                      | Your Azure subscription ID.                                                                                                                                                          |
| name                        | Required          | N/A                                                      | The name of your resource group                                                                                                                                                      |
| appPassword                 | Required          | N/A                                                      | The password to create the resource. It must be at least 16 characters long, contain at least 1 upper or lower case alphabetical character, and contain at least 1 special character |
| environment                 | Optional          | dev                                                      | N/A                                                                                                                                                                                  |
| location                    | Optional          | `westus`                                                 | Your Azure resource group region                                                                                                                                                     |
| tenantId                    | Optional          | default tenantId                                         | ID of your tenant if required.                                                                                                                                                       |
| customArmTemplate           | Optional          | `/DeploymentTemplates/template-with-preexisting-rg.json` | For Azure Functions or your own template for a custom deployment.                                                                                                                    |
| createLuisResource          | Optional          | `true`                                                   | The LUIS prediction resource to create. Region is default to `westus` and cannot be changed.                                                                                         |
| createLuisAuthoringResource | Optional          | true                                                     | The LUIS authoring resource to create. Region is default to `westus` and cannot be changed.                                                                                          |
| createQnAResource           | Optional          | `true`                                                   | The QnA resource to create.                                                                                                                                                          |
| createCosmosDb              | Optional          | `true`                                                   | The CosmosDb resource to create.                                                                                                                                                     |
| createStorage               | Optional          | `true`                                                   | The BlobStorage resource to create.                                                                                                                                                  |
| createAppInsights           | Optional          | `true`                                                   | The AppInsights resource to create.                                                                                                                                                  |
