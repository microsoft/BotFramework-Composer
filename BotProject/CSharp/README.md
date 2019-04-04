# Bot Project
Bot project is the launcher project for the bots written in [OBI](https://github.com/Microsoft/botframework-obi) format.

## Download and run
### restore the packages
* You can restore the packages from this feed directly in vs nuget package manager: https://fuselabs.visualstudio.com/Composer/_packaging?_a=feed&feed=ComposableDialog 
* You can also add feed by:
* nuget.exe sources Add -Name "ComposableDialog" -Source "https://fuselabs.pkgs.visualstudio.com/_packaging/ComposableDialog/nuget/v3/index.json"
* If you are unauthorized to restore the packages, please contact luhan@microsoft.com. 
### config your bot
* The only thing you need to config is appsetting.json, which have a bot setting to launch the bot
```
    appsettings.json：
    "bot": {
      "provider": "localDisk",
      "path": "../../Bots/SampleBot3/bot3.botproj"
    }
```
### Build & run bot
* dotnet build
* dotnet run
* It will start a web server and listening at http://localhost:3979.
### Test bot
* You can set you emulator to connect to http://localhost:3979/api/messages.

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
