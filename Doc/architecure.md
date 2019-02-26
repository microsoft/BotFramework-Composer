# Architecture

## components

This prototype includes two components

#### application

  A web app providing an editing experience on bot assets. The application has access to any bots made available to it from the `bots` property in `config.json`. See below for more details. In addition to bot-specific concerns, the application has features to enable common user scenarios like routing, state-management, and authentication.

  The application also has the ability to start a bot by sending a signal to a BotLauncher (working name). This is a common scenario after one has used the application's dialog editing capabilities and wants to see the current state of the dialogs through conversation with the bot's runtime. The view layer/channel of the bot (WebChat, etc) is not coupled to the application, and may or may not be rendered inside of it.

  The application will be able to host 3rd-party javascript, html, & css. The isolation mechanism in doing so is through use of `<iframe />` tags. We will expose an interface for 1P and 3P partners to provide "extensions" in the application, and be able to extend their extensions for reuse in their instance of Composer.

#### launcher
  The BotLauncher is at its core the OBI type-loader. Given bot assets or a path to find them, the BotLauncher uses the OBI type-loader to generate a dialog tree in memory. Currently the BotLauncher also starts the bots runtime and exposes the web endpoint to communicate with the bot.

  Given signal and appropriate payload, the BotLauncher can build a dialog tree and start up a bot at the users requested location (endpoint/port). and start a bot instance and have it ready to serve at a public endpoint. The application's view layer/channel will then be able to connect to it during a conversational design session and interact with the dialog tree.

  The launcher will have support to run a bot on different runtimes (Nodejs, C#) and designed such that additional 3P runtimes can be provided and utilized by the community. 

  The launcher can be configured to watch the bot assets (.lu, .lg, .dialog, etc) and reload the bot runtime when a change in these files are observed.

#### bots
Each bot is defined by a ".bot" file, which includes all the references to the assets this bot would use. Only declarative files live in this folder.

**note** this is not the shape of the .bot file currently used in SDK v4 of Bot Framework Emulator. The structure of the .bot file in Composer is subject to change. 

## data flow

The bot's assets are the source of truth for the bot at any given time. The Application will hold dirty bot dialogs that will be lost until written into the bot's assets. The BotLauncher only references the state of the bot's assets and cannot read dirty bot assets held in the application.

<Needs Image>

## folder structure

Here is a overview of a potential folder structure

    BotLauncher
    |____CSharp
    |  |____runtime.cs
    |____Node
    |  |____runtime.js

    Composer
    |____pacakges
    |  |____client           // main web app
    |  |____server           // api server
    |  |  |____config.json 
    |  |____extensions       // extensions

    Echo-bot
    |____bot.bot
    |  |____dialogs
    |  |____lu
    |  |____lg

## a bot's .bot file

Here is an example of a .bot file, with glob patterns for bot asset discovery.

```
{
  services: [
    {
      type: "luis",
      endpoint: ${luis_endpoint},
      app_id: ${luis_app_id},
      token: ${luis_token} 
    },
    {
      type: "qna",
      endpoint: ${qna_endpoint},
      app_id: ${qna_app_id},
      token: ${qna_token} 
    }
  ],

  files: [
    "./**/*.lu",
    "./**/*.lg",
    "./**/*.dialog"
  ]
 
  entry: "./dialogs/main.cog",     // call entry instead of entryDialog, because it might not be a 'Dialog'
}
```

the .bot file is used for the following:
- asset discovery via glob patterns
- service discovery for luis and qna, etc
- service credentials
- an entry point for the dialog tree

**note:** a goal to consider is the service credentials being *templated* in this file. we've made assumptions in the past about where these credentials should be stored and their shape.

## Composer configuration

### packages/server/config.json

server is api server of Composer web app, which is also the component that work with local files and talk to bot launcher to run bot. 

```
{
    // define which bot this composer is editing
    "bot": {
        "provider": "localDisk",
        "path": "../../../Bots/SampleBot3/bot3.bot"
    },

    // define which connector this composer is using to talk to launcher
    // each type of connector knows how to invoke and talk to certain type of bot launcher
    // it's not the concern of the composer
    "launcherConnector": {
        "type": "CSharp", 
        "path": "../BotLauncher/CSharp"
    }
}
```


## Editor extensions

see [Extensions](https://github.com/boydc2014/composer-prototype/blob/master/Composer/README.md#extensions)
