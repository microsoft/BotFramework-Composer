
# Microsoft Bot Framework Composer

[![Build Status](https://fuselabs.visualstudio.com/Composer/_apis/build/status/ComposerCI/Composer-CI?branchName=master)](https://fuselabs.visualstudio.com/Composer/_build/latest?definitionId=516&branchName=master)

## Overview 

Bot Framework Composer is an integrated development environment (IDE) for building bots and other types of conversational software with the Microsoft Bot Framework technology stack. Inside this web-based tool, you'll find everything you need to build a modern, state-of-the-art conversational experience:
* A visual dialog Composer
* Tools to train and manage a language understanding (NLU) component
* A powerful language generation and templating system
* A ready-to-use bot runtime executable

Bot Framework Composer enables teams working to create bots to build all kinds of conversational experiences that use the latest features from the Bot Framework SDK without writing code. The Composer app reads and writes from the [Adaptive Dialog](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/adaptive-dialog) format, a [declarative](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/adaptive-dialog/declarative) JSON specification shared by many tools provided by the Bot Framework. Dialogs, NLU training data and message templates are treated like normal developer assets - files that can be committed to source control and deployed alongside code updates. 

## Get Started
To get your self familiar with the Composer, read [Introduction to Bot Framework Composer](https://github.com/microsoft/BotFramework-Composer/blob/master/docs/introduction_to_bfd.md#introduction-to-bot-framework-composer).

To get started [install the Bot Framework Composer](#Installing-Bot-Framework-Composer) on your local machine, create your first bot and review the various samples.

### Installing Bot Framework Composer
The Bot Framework Composer is designed to be a hosted web app. Currently, you need to run the Composer locally as a web app. 

To start, clone the Composer GitHub repository. 
```
git clone https://github.com/microsoft/BotFramework-Composer.git
```

Next,you have two options for running Composer locally:
* [Using a docker image](#Using-docker-image) (Recommended) 
* [Build and run Composer locally](#Build-and-run-Composer)


### Using docker image 

Using a docker provides a more controled and isolated environment for you to run the composer.  There are two docker images, one for the Composer web app and one for the bot project runtime. 

#### Prerequisites
* [docker-compose](https://docs.docker.com/compose/install/)
* [docker](https://www.docker.com/)
* [Bot Framework Emulator](https://github.com/microsoft/BotFramework-Emulator/releases/latest)
* [.NET Core SDK](https://dotnet.microsoft.com/download)

  NOTE: If you follow the instructions of installing docker for Windows or MacOs, the Docker Desktop  and Docker Toolbox already include Compose along with other Docker apps, so most  users do not need to install Compose separately.  

#### Instructions

* Run the docker images

    Form a terminal windows
    ```
    docker-compose up
    ```
    This will build two images for composer-app and bot-runtime if not exits, then start two containers based on these images.
    
    To use Composer, open a browser and navigate to http://localhost:3000
    
 
 * Restart the Composer app
 Should you find yourself needing to restart the composer app. From the terminal window you are using to run the docker image:
 If the docker image is currently running, use ctrl+c in the terminal window to stop the docker app, then use *docker-compose up*
 

* Build

    If you made some changes after first run and you would like to rebuild the images by call

    ```
    $ docker-compose build
    ```

* Test Bot With Emulator

    When using Emulator to test your bot, make sure you use ngrok and *uncheck* 'bypass ngrok for local addresses', because container is considered as remote, even the address looks like local. 
    
    The bot is running on http://localhost:3979/api/messages. 
   

* Advance use: Development

    If you are developing some components and you want fast iteraction without re-building container images on every change, please refer to the document to each component for setup instuctions
    
    * [Designer App](https://github.com/microsoft/BotFramework-Designer/tree/master/Composer)
    * [Bot Runtime](https://github.com/microsoft/BotFramework-Composer/tree/master/BotProject/CSharp)


### Build and run Composer
With this option you need to use [Yarn](https://yarnpkg.com) to build the Composer app and run it locally.

#### Prerequisites
* [Node.js](https://nodejs.org/en/)
* [Yarn](https://yarnpkg.com/en/docs/install)
* [Bot Framework Emulator](https://github.com/microsoft/BotFramework-Emulator/releases/latest)
* [.NET Core SDK](https://dotnet.microsoft.com/download)


#### Instructions

* Build and run Composer

Open a new terminal window. Navigate to the Bot Framework Composer repo. In the repo, navigate to the **Composer** folder. Run the following commands:
```
yarn install
```
This command gets all dependent packages.

```
yarn build
```
This command build the Composer app. The build process can take few minutes.

```
yarn startall
```
This command starts the Composer authoring application and the CSharp Bot runtime. 

 To use Composer, open a browser and navigate to http://localhost:3000
 
* Run the Bot Project 

To test the bot you are creating with the Composer you need to run the Bot Project that comes with the Composer. 

Open a new terminal window. Navigate to the Bot Framework Composer repo. In the repo, navigate to the **BotProject\CSharp** folder. Run the following command:
```
dotnet run
```
This will build and run a Bot Framework bot that the Composer connects to.

The bot is running on http://localhost:3979/api/messages.



## Related projects
* [Microsoft Open Bot initiative (OBI)](https://github.com/Microsoft/botframework-obi)

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
