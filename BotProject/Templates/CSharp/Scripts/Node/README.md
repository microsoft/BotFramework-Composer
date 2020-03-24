# Node Deployment

## Instructions
> 1. npm install
> 2. Repalce the parameters in create.ts
>> const subId = 'Azure SubScription ID'<br>
>> const projFolder = 'The Path to ProjFolder, this  should be the root path which includes *.csproj'<br>
>> const bot = new BotProjectDeploy(subId, projFolder)<br>
>> const name = 'Repalce With Your Bot Name, This should be unique to global'<br>
>> const environment = 'Replace With Environment'<br>
>> const location = 'Replace With App Location, for example, westus'<br>
>> const luisAuthoringKey = null<br>
>> const luisAuthoringRegion = null<br>
>> const appId = null<br>
>> const appPassword = 'Replace With Your Password'<br>

> 3. npm run create

## Details
1. If you don't provide appId, the script will create an app registration based on your password.
2. If you don't provide luis authoring key, the script will create a luis authoring service and related luis service on Azure
