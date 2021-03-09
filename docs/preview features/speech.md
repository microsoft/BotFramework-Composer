# Enabling a connection to Direct Line Speech

Once the Speech connection has been enabled in Bot Framework Composer, or via the Azure portal, there are a few additional steps required to get your bot connected.

Pre-requisites: Before you can connect a bot to Speech, be sure you've completed the following actions:

* You've built a basic bot in Composer.
* You've created a publishing profile and published your bot to Azure.
* You've [created a Speech Service](https://ms.portal.azure.com/#create/Microsoft.CognitiveServicesSpeechServices) in the same DC Region as your Bot Registration. We recommend you add it to the same Resource Group if possible.
* You've enabled the Speech connection in your bot's settings.

To test your bot's speech capabilities:

* Download the [Windows Voice Assistant Client](https://github.com/Azure-Samples/Cognitive-Services-Voice-Assistant/releases). (Only available for Windows)
* In Windows Voice Assistant Client put your Speech Key in the Subscription Key field under General Settings and your DC region in the Subscription Key Region. Save your changes.
![image](https://user-images.githubusercontent.com/18688053/109964028-bead8d80-7cb2-11eb-8161-738db214ce9e.png)
* Test your solution by clicking Reconnect and using the microphone button in the bottom right of the Windows Voice Assistant Client.
![image](https://user-images.githubusercontent.com/18688053/109963900-90c84900-7cb2-11eb-8c0c-7a6b1c7980cd.png)
