# Enabling a connection to Web Chat

Once the Web Chat connection has been enabled in Bot Framework Composer, or via the Azure portal, there are a few additional steps required to get your bot connected.

Pre-requisites: Before you can connect to your bot with Web Chat, be sure you've completed the following actions:

* You've built a basic bot in Composer
* You've created a publishing profile and published your bot to Azure
* You've enabled the Web Chat connection in your bot's settings

Once enabled, you can navigate to your bot's control panel in the Azure Portal to test it.

* Find your [Bot Channel Registration](https://ms.portal.azure.com/#blade/HubsExtension/BrowseResource/resourceType/Microsoft.BotService%2FbotServices) in the portal.
* Click "Test in Web Chat" on the left nav
* You should be able to send messages to and receive messages from your bot

To customize and deploy the web chat control to a website, [follow the instructions here](https://docs.microsoft.com/azure/bot-service/bot-service-channel-connect-webchat?view=azure-bot-service-4.0#embed-the-web-chat-control-in-a-web-page).
