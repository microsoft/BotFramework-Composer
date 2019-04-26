## Bot Project
Bot project is the launcher project for the bots written in [OBI](https://github.com/Microsoft/botframework-obi) format.

## Instructions

### Prerequisite:
* Install .Netcore 2
* Install nuget

### Add Nuget Feed
* option 1: use VisualStudio "Manage Nuget Packages" to add a new package feed: "https://botbuilder.myget.org/F/botbuilder-declarative/api/v3/index.json"
* option 2: nuget sources Add -Name "ComposableDialog" -Source "https://botbuilder.myget.org/F/botbuilder-declarative/api/v3/index.json".

### Commands:

* dotnet restore // for the package updates
* dotnet build // build
* dotnet run // start the bot
* It will start a web server and listening at http://localhost:3979.

### Test bot
* You can set you emulator to connect to http://localhost:3979/api/messages.

### config your bot
* The only thing you need to config is appsetting.json, which have a bot setting to launch the bot
```
    appsettings.json：
    "bot": {
      "provider": "localDisk",
      "path": "../../Bots/SampleBot3/bot3.botproj"
    }
```


## .botproj folder structure
```
    bot.botproj, bot project got the rootDialog from "entry"
    {
        "services": [{
            "type": "luis",
            "id": "1",
            "name": "TodoBotLuis",
            "lufile": "todo.lu",
            "applicationId": "TodoBotLuis.applicationId",
            "endpointKey": "TodoBotLuis.endpointKey",
            "endpoint": "TodoBotLuis.endpoint"
        }],
        "files": [
            "*.dialog",
            "*.lg"
        ],
        "entry": "main.dialog"
    }
```
* please refer to [Samples](https://github.com/Microsoft/BotFramework-Composer/tree/master/SampleBots) for more samples.
