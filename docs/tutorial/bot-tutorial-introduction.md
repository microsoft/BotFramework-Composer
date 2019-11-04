# Build a weather bot
In this tutorial, you will build a weather bot using Bot Framework Composer. We'll start simple and gradullay introduce sophistication. Here are the areas we'll cover: 

- Create a new Bot
- Author a new dialog
- Add global help, cancel handling
- Use language generation to power your bot's responses
- Use Adaptive cards
- Handling interruptions in the conversation flow
- Add multiple dialogs to help your bot fulfill more than one scenario 

## Prerequisites
- [Bot Framework Composer](./docs/setup-yarn.md)
- Cognitive Service Language Understanding authoring resource. To verify, click on Environment details tab in the integrated documentation pane. You should see non empty values for `LUIS authoring key 1` and `LUIS authoring key 2`.


# Create the Weather Bot

The first step in creating a bot with Bot Framework Composer is to create a new bot project from the home screen in the Composer. This will create a new folder locally on your computer with all the files necessary to build, test and run the bot.

## Create Project

1. From the home screen, select `New` from the upper left corner. You'll be presented with a dialog with options to either create an empty bot project from scratch, or to create one based on a template. For this workshop, make sure `Create from Scratch` selected and click `Next`

   ![create project](../media/tutorial-weatherbot/01/create-1.png)

2. The second screen asks for a `Name` and `Description` of your bot. Let's call it:

      `WeatherBot`
     
   and give it a description:
   
      `A friendly bot who can talk about the weather.`

   > Make sure not to put any spaces or special characters in the bot's name.

   > Leave the `Location` field with its default value - this will put the bot project into Composer's default project folder where it will be easy to find.  

   ![create bot](../media/tutorial-weatherbot/01/create-2.png)

3. Click `Next`, and Composer will create the project for you!

## Give your bot something to say

After creating your bot, Composer will load the new bot's `Main` dialog in the editor.  It should look like this:

![bot conversation](../media/tutorial-weatherbot/01/empty-main-dialog.png)

Each dialog contains one or more `Triggers` that define the actions available to the bot while the dialog is active. Right now the dialog is empty, so the bot won't do anything.

You will notice that the new bot is pre-configured with one trigger in the left dialogs window - `ConversationUpdate`. 

> Triggers help your dialog capture events of interest and respond to them using actions.

1. Click the `ConversationUpdate` trigger in the left hand explorer.

2. You will see a new flow has been added to the dialog. 

   ![dialog](../media/tutorial-weatherbot/01/new-flow.png)

3. To help keep the bot organized, let's rename this trigger to something that describes what it does. In the `property editor` on the right side of the screen, click on the name of the trigger ("ConversationUpdate"). You'll be able to update the title there, and the change will be instantly reflected in the dialog and navigation on the left. Rename ths trigger to:

      `WelcomeTheUser`

   ![trigger](../media/tutorial-weatherbot/01/rename-trigger.gif)

Now, let's actually make the bot do something! 
Inside the flow, you'll see that the teal `Trigger` box has a line below it that includes in a "+" button.

The "+" button can be used to add `Actions` to the conversation flow. You can use this to add actions to the end of a flow, or insert actions at an earlier point.

For now, let's instruct the bot to send a simple greeting.

4. Click the "+" button and select the first menu item `Send a response`.

   ![menu](../media/tutorial-weatherbot/01/add-send-activity.gif)

5. Select the new `Send a response` action in the flow and it's properties will appear on the right hand side of the screen.  This action has only one main property - the text of the activity to send.

6. Type a welcome message into this field. It is always a good idea to have your bot introduce itself and explain it's main features.  So let's make the welcome message something like:

      `Hi! I'm a friendly bot that can help with the weather. Try saying WEATHER or FORECAST.`

Your bot should now look like this:

   ![activity](../media/tutorial-weatherbot/01/send-activity.png)

Next, let's temporarily disable the recognizer for the main dialog. We will get back to this in the next step.

7. Click on `WeatherBot.Main` in the left pane to bring up the properties editor for the root dialog.

6. In the property editor on the right hand side, click on `Recognizer type` and select `None`.

   > Dialogs in Composer support two different recognizer types - LUIS, Regex. Unless you need intent classification or entity extraction, we can remove recognizer by setting it to `None`.
   
   ![recognizer](../media/tutorial-weatherbot/01/recognizer-none.png)

## Start your bot and test it

Now that our new bot has its first simple feature, let's launch it in the emulator and make sure everything works.

1. Click the `Start Bot` button in the upper right hand corner of the screen.  This tells Composer to launch the bot's runtime (an external app powered by the Bot Framework SDK) and updates it with the latest content and settings from Composer.

2. After a few seconds, a second link will appear next to the button thats `Test bot in emulator`.  Click this link to open Emulator and connect.

   ![start bot](../media/tutorial-weatherbot/01/start-bot.gif)

You should see a window like this appear:

   ![emulator](../media/tutorial-weatherbot/01/emulator-launch.png)

And the bot should immediately greet you with the message we just configured:

   ![emulator](../media/tutorial-weatherbot/01/greeting-in-emulator.png)

We now have a working bot, and we're ready to add some more substantial functionality!

## Next steps
- [Add a dialog](./bot-tutorial-add-dialog.md)
