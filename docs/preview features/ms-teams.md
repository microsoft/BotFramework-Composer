# Enabling a connection to MS Teams

Once the MS Teams connection has been enabled in Bot Framework Composer, or via the Azure portal, there are a few additional steps required to get your bot connected.

Pre-requisites: Before you can connect a bot to MS Teams, be sure you've completed the following actions:

* You've built a basic bot in Composer
* You've created a publishing profile and published your bot to Azure
* You've enabled the MS Teams connection in your bot's settings

To finalize the connection to Teams, follow this instructions:

1. Install [App Studio](https://aka.ms/InstallTeamsAppStudio), a Teams app that makes it easy to integrate your new bot with Teams. [Follow the full instructions here](https://docs.microsoft.com/microsoftteams/platform/concepts/build-and-test/app-studio-overview).
2. Once installed, navigate to the the "Manifest editor" tab and select "Create a new app"
3. Fill out the information in the "App details" section
4. Navigate to the "Bots" item in the left hand nav.
5. [Follow the instructions here](https://docs.microsoft.com/microsoftteams/platform/concepts/build-and-test/app-studio-overview#bots) to connect to your existing bot.
6. Finally, navigate to the "Test and distribute" item in the left hand nav to install your new bot application in the Teams channel where you'd like to test it.

