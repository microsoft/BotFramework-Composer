# Set up the Bot Framework Composer using Yarn

In this article you will learn how to run the Bot Framework Composer as a hosted web app locally using Yarn. 

<!---To set up and install Composer with docker you can read more [here](link to docker setup).-->

## Prerequisites

- [Node.js](https://nodejs.org/dist/v12.13.0/). Use version 12.13.0 or later.
- The latest stable release of [Yarn](https://yarnpkg.com/en/docs/install).
- The [Bot Framework Emulator](https://github.com/microsoft/BotFramework-Emulator/releases/latest).
- You will need the [.NET Core SDK 2.2](https://dotnet.microsoft.com/download/dotnet-core/2.2) to test your bot.

## Set up yarn for Composer
1. To start, open a terminal and clone the Composer GitHub repository. You will use this terminal for the rest of the steps in this section.

    ```
    git clone https://github.com/microsoft/BotFramework-Composer.git
    ```

2. After cloning the repository, navigate to the **Bot Framework Composer** folder and run the following commands to get all required packages:

    ```
    CD Composer
    yarn 
    ```

3. Next, run the following command to build the Composer application, this command can take several minutes to finish:

    ```
    yarn build 
    ```
  
    > [!NOTE] If you are having trouble installing or building Composer run `yarn tableflip`. This will remove all of the Composer application's dependencies (node_modules) and then it reinstalls and rebuilds all of its dependencies. Once completed, run `yarn install` and `yarn build` again. This process generally takes 5-10 minutes.

4. Again using Yarn, start the Composer authoring application and the bot runtime:

    ```
    yarn startall
    ```

5. Once you see **Composer now running at:** appear in your terminal, you can run Composer in your browser using the address http://localhost:3000.

    ![browser address](./media/setup-yarn/address.png)

Keep the terminal open as long as you plan to work with the Composer, as soon as you close it, Composer will stop running.

The next time you need to run the Composer, all you will need to run `yarn startall` from the Composer directory.

## Next Steps

- Create a [echo bot](./tutorial-create-echobot.md) using Composer.
