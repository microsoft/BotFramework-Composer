
# Microsoft Bot Framework Designer

[![Build Status](https://fuselabs.visualstudio.com/Composer/_apis/build/status/ComposerCI/Composer-CI?branchName=master)](https://fuselabs.visualstudio.com/Composer/_build/latest?definitionId=516&branchName=master)

## Overview 

Bot Framework Designer provides a tool for 1st and 3rd party professional conversation creators with an extensible framework to build compelling Conversational AI solutions for Microsoft customers. 

It provides 
* a professional tool to enables multi-disciplinary team of professional conversation creators to create, edit and refine dialogs 
* a dialog authoring user experience for OBI standard file formats (Dialogs, dialog steps, etc) to allow users to create and edit dialogs to create 
  * Reusable dialog components 
  * Standalone bots for Enterprise scenarios (ISV/SIs), or 
  * Bot-building solutions for customers (MCS)
  * An extensible solution to enhance bot creation experience and support custom dialog types and editors 

## Get Started

### Prerequisites

* [docker-compose](https://docs.docker.com/compose/install/)
* [docker](https://www.docker.com/)

  NOTE: If you follow the instructions of installing docker-compose, and install docker-desktop for your platform, you should already have docker-compose and docker. 

### Instructions

* Run

    Just run
    ```
    $ docker-compose up
    ```
    this will build two images for composer-app and bot-runtime if not exits, then start two containers based on these images

* Build

    If you made some changes after first run and you would like to rebuild the images by call

    ```
    $ docker-compose build
    ```

* Test Bot With Emulator

    When using Emulator to test your bot, make sure you use ngrok and *uncheck* 'bypass ngrok for local addresses', because container is considered as remote, even the address looks like local. 
   

* Development

    If you are developing some components and you want fast iteraction without re-building container images on every change, please refer to the document to each component for setup instuctions
    
    * [Designer App](https://github.com/microsoft/BotFramework-Designer/tree/master/Composer)
    * [Bot Runtime](https://github.com/microsoft/BotFramework-Composer/tree/master/BotProject/CSharp)


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
