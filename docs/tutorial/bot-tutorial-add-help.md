# Add Help and Cancel

With even a simple bot, it is a good practice to provide a help command. You'll also want to provide a way for users to back out. 

1. Click `+ New Dialog` in the left hand explorer. You'll see a popup window.
2. Give this new dialog the name:

      `help`

   ![](../media/tutorial-weatherbot/04/help-dialog.png)

3. Click `Next`, and you'll land in the editor view for the new help dialog. 

   <a name="create-begin-dialog-trigger"></a>

   Composer created this new dialog with one `BeginDialog` trigger pre-configured. 

4. With the `BeginDialog` trigger selected, use the `+` button at the bottom of the flow, choose `Send a response`
5. In the property editor on the right side, set the text of the activity to:

      `I am a weather bot! I can tell you the current weather conditions. Just say WEATHER.`

   ![](../media/tutorial-weatherbot/04/help.png)

   Next, let's wire this new dialog up to the Main dialog (your bot's brain).

6. In the left hand explorer, click on `weatherBot.Main` at the top of the list.
7. In the right hand property pane, find the "Language Understanding" section and click the "Add" button at the bottom. This will reveal 2 new fields, allowing you to define a new intent.
8. Set the `Intent` field to:

      `help`

      Set the `Pattern` field to: 

      `help`

      ![](../media/tutorial-weatherbot/04/help-intent.png)

9. In the left hand explorer, click `+ New Trigger`
10. In the resulting dialog box, select `Intent`, then choose the new `help` intent. Submit the dialog.

     ![](../media/tutorial-weatherbot/04/new-trigger.png) 

11. In the flow editor, click the `+` button at the bottom of the empty flow.
12. Choose `Dialogs management >` and then select `Begin a new dialog`

      ![](../media/tutorial-weatherbot/04/help-trigger-flow.png)

13. In the right hand property editor, select the `help` dialog.

      ![](../media/tutorial-weatherbot/04/help-props.png)

14. Click `Reload bot` and open it in the emulator.

----

Now, in addition to giving you the current weather, your bot can also offer help.

![](../media/tutorial-weatherbot/04/basic-help.gif)

However, notice that once you start the weather dialog by saying weather, your bot doesn't know how to provide help. Let's fix this!


---

## Allowing interruptions

1. In Composer's left hand explorer, navigate back to the `getWeather` dialog. Make sure to highlight the `BeginDialog` trigger.
2. Select the `Bot Asks` node in the flow that says `What is your zipcode?`
3. In the right hand property editor, set `Allow Interruptions` to `true`
   ![](../media/tutorial-weatherbot/04/interrupts.png)

   > This tells Bot Framework to consult the parent dialog's recognizer, which will allow the bot to respond to `help` at the prompt as well.

4. Hit `Reload Bot` and open it in the emulator.

---

Say `weather` to your bot.  It will ask for a zipcode.

Now say `help`. It'll provide the global help response, even though that intent and trigger are defined in another dialog. Interruptions are a powerful way to make complex bots - we'll come back to that later.

![](../media/tutorial-weatherbot/04/better-help.gif)

For now, let's add one more global function - a cancel command.

---

## Global cancel

1. In Composer's left hand explorer, click the `+ New Dialog` button again. 
2. Give this new dialog the name:

      `cancel`

3. Use the `+` button at the bottom of the flow, choose `Send a response`
4. In the property editor on the right side, set the text of the activity to:

      `Canceling!`

5. Use the `+` button again, this time choose `Dialog management >`, then `Cancel all dialogs`

      > When triggered, this will cause the bot to cancel any active dialogs, and send the user back to the main dialog.

      ![](../media/tutorial-weatherbot/04/cancel-flow.png) 

6. In the left hand explorer, click on `weatherBot.Main` at the top of the list.
7. In the right hand property pane, find the "Language Understanding" section and click the "Add" button at the bottom. This will reveal 2 new fields, allowing you to define a new intent.
8. Set the `Intent` field to:

      `cancel`

9. Set the `Pattern` field to:

      `cancel`

10. In the left hand explorer, click `+ New Trigger`
11. In the resulting dialog box, select `Intent`, then choose the new `cancel` intent. Submit the dialog.
12. In the flow editor, click the `+` button at the bottom of the empty flow.
13. Choose `Dialog management >` and then select `Begin a new dialog`
14. In the right hand property editor, select the `cancel` dialog.

      ![](../media/tutorial-weatherbot/04/cancel-trigger.png) 

15. Click `Reload bot` and open it in the emulator.

---

Say `weather` to your bot.  It will ask for a zipcode.

Now say `help`. It'll provide the global help respons.

Now, say `cancel` - notice, the bot doesn't resume the weather dialog. Instead, it confirms the cancelation, and waits for your next message.


## Next steps
- [Add Language Generation](./bot-tutorial-lg.md)
