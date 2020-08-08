# Deploying Bot Framework Composer

This document walks you through the options and steps for deploying Bot Framework Composer (Composer).
The  Composer is designed to be a hosted web app. Currently, you need to run the Composer locally as a web app. Composer generates everything you need to run your bot locally as well as deploy to Azure Bot service to run on Azure.

For overview of Composer, read [Introduction to Bot Framewrok Composer](./introduction-to-Composer)


## Deployment options
You have two options  running Composer locally:
* [Using a docker image](#Using-a-docker-image)
* [Build and run Composer locally](#Build-the-Composer-project-and-run-it-locally)

For both options you need to clone the Composer GitHub repository.
```
git clone https://github.com/microsoft/BotFramework-Composer.git
```

## Using a docker image

Using a docker image provides a more controled and isolated environment for you to run the composer.  There are two docker images, one for the Composer web app - where you create assets in the form of dialogs and language files, and one for the bot project runtime - which loads assets created by Composer and execute them.

### Prerequisites
- [docker-compose](https://docs.docker.com/compose/install/)
- [docker](https://www.docker.com/)
- [Bot Framework Emulator](https://github.com/microsoft/BotFramework-Emulator/releases/latest)


>NOTE: If you follow the instructions of installing docker for Windows or MacOs, the Docker Desktop  and Docker Toolbox already include Compose along with other Docker apps, so most  users do not need to install Compose separately.

### Instructions

#### Run docker images
 Form a terminal window run the following command

    ```
    docker-compose up
    ```

This command builds two docker images, if they dont exists, one for the composer-app and another for the bot-runtime. This command also  starts the two containers based on these images.

NOTE:  first run can take a few minutes to build the docker images.


    To use Composer, open a browser and navigate to http://localhost:3000


 ### Restart the Composer app

If you need to restart the composer app, from the terminal window you are using to run the docker image:
 - If the docker image is currently running, use *ctrl+c in the terminal window to stop the docker app.
 - *docker-compose up* to run the docker images


 ### Test your Bot using Bot Framework Emulator

 When using the Bot Framework Emulator to test your bot, make sure you use ngrok and *uncheck* 'bypass ngrok for local addresses', because container is considered as remote, even the address looks like local.

    The bot is running on http://localhost:3979/api/messages.


### build docker images

If you made some changes after first run and you would like to rebuild the images by call.

    ```
    $ docker-compose build
    ```


### Advance use: Development

If you are developing some components and you want fast iteraction without re-building container images on every change, please refer to the document to each component for setup instuctions

- [Designer App](https://github.com/microsoft/BotFramework-Designer/tree/master/Composer)
- [Bot Runtime](https://github.com/microsoft/BotFramework-Composer/tree/main/runtime/dotnet/azurewebapp)


## Build the Composer project and run it locally

In this option you will build and run the Composer project locally.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (verion 12.x)
- [Yarn](https://yarnpkg.com/en/docs/install)
- [.NET Core SDK](https://dotnet.microsoft.com/download) (version 2.2.x)
- [Bot Framework Emulator](https://github.com/microsoft/BotFramework-Emulator/releases/latest)


### Instructions

#### Build and run Composer

Open a new terminal window. Navigate to the folder that contains the Bot Framework Composer repo. In the repo, navigate to the **Composer** folder. Run the following commands:

```
yarn install
```
This command gets all dependent packages.

```
yarn build
```
This command builds the Composer app. The build process can take few minutes.

```
yarn start
```
This command starts the Composer authoring application and the dotnet Azure WebApp Bot runtime which is running on http://localhost:3979/api/messages.

To use Composer, open a browser and navigate to http://localhost:3000

Alternatively you can use one command to start both the Composer and the Bot runtime
```
yarn startall
```
This command starts the Composer authoring application and the dotnet Azure WebApp  Bot runtime.

