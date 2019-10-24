# Set up Bot Framework Composer using yarn

The Bot Framework Composer is designed to be a hosted web app. Currently, you need to run the Composer locally as a web app and can do so using yarn. To set up and install Composer with docker you can read more [here](link to docker setup). 

## Prerequisites

- [Node.js](https://nodejs.org/en/)
- [yarn](https://yarnpkg.com/en/docs/install)
- [Bot Framework Emulator](https://github.com/microsoft/BotFramework-Emulator/releases/latest)
- [.NET Core SDK 2.2.109](https://dotnet.microsoft.com/download)

## Set up yarn for Composer
To start, clone the Composer GitHub repository. 
```
git clone https://github.com/microsoft/BotFramework-Composer.git
```

After cloning the repo open a terminal and navigate to the Bot Framework Composer folder. In the repo, navigate to the **Composer** folder. Run the following commands:
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


To use Composer open a browser and navigate to http://localhost:3000 or http://localhost:5000. 
