# Node Deployment

## Instructions
> 1. npm install

> 2. You should provide following params:

     // Subscription Id of Auzre Account
     subId: string

     // The credentials from user login
     creds: any

     // The project path to deploy
     projPath: string

     // Logger
     logger: (string) => any
     
     // Deployment settings file path
     deploymentSettingsPath?: string

     // Deploy file path, default is .deployment file
     deployFilePath?: string

     // Zip file path, default is 'code.zip'
     zipPath?: string

     // Pulblishing folder for 'dotnet publish' command, default is 'bin/Release/netcoreapp3.1'
     publishFolder?: string

     // The deployment settings file path, default is 'appsettings.deployment.json'
     settingsPath?: string

     // The ARM template file path, default is 'DeploymentTemplates/template-with-preexisting-rg.json'
     templatePath?: string

     // Dotnet project path, default is 'Microsoft.BotFramework.Composer.WebApp.csproj'
     dotnetProjectPath?: string

     // Lubuild generated folder path, default is 'generated'
     generatedFolder?: string

     // Remote bot json dialog path, default is 'ComposerDialogs'
     remoteBotPath?: string
> 3. run 'create' method to create azure resources, including Bot Channels Registration, Azure Cosmos DB account, Application Insights, App Service plan, App Service, Luis, Storage account
> 4. run 'deploy' method to train the related luis models and deploy the runtime to Azure.
## Details
1. If you don't provide appId, the script will create an app registration based on your password.
2. If you don't provide luis authoring key, the script will create a luis authoring service and related luis service on Azure
