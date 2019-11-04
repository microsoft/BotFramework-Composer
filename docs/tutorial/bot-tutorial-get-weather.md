# Get weather report

1. In the explorer, click on `getWeather` to select the dialog and reveal the triggers it contains.
2. Click on the `BeginDialog` trigger underneath getWeather. The first thing we need to do to check a user's local weather is collect the user's location. Our weather API accepts a 5 digit zipcode as a parameter. So, let's add a `Number Input` to prompt the user for a `zipcode`.
3. Click the "+" button in the flow and select `Ask a question`. You'll see a variety of options for asking for different types of input.
4. Select `Text input` from the sub-menu. Two new nodes will appear in the flow!

   > You use prompts to collect information from user. Prompt are broken down into a few pieces. We'll configure each separately.

   ![](../media/tutorial-weatherbot/03/empty-prompt.png)

5. Click on the `Bot Asks` node. This part of the prompt represents the message the bot will send to the user requesting information. In the property editor set the prompt to:

      `What is your zipcode?`

6. Set the `Default value` property (next to Max turn count) to `'98052'` (include the quotes). 

   > By default prompts are configured to ask the user for information `Max turn count` number of times (defaults to 3). When this happens, the prompt will stop and set the `Default value` to the `Property` and move forward with the conversaiton. 

   ![](../media/tutorial-weatherbot/03/zipcode-prompt.png)

7. Next, click the `User Input` tab in the property editor. This part of the prompt represents the user's response, including where to store the value and how to pre-process it.

8. Here, we can specify what property in memory will be used to store the user's response. In `Property to fill`, enter the value:

      `user.zipcode`

   For `Output Format`, select `trim`. This ensures leading and trailing spaces in user input are trimmed before the value is assigned to `user.zipcode`

   ![](../media/tutorial-weatherbot/03/zipcode-answer.png)

9. Click on the `Others` tab in the property editor. This section allows you to specify validation rules for the prompt, as well as error messages that will be used if the user provides an invalid response.

10. In the `Unrecognized Prompt` field, enter:
      
      `- Sorry, I do not understand '{this.value}'. Please specify a zipcode in the form 12345`

    In the `Invalid Prompt` field, also enter:

      `- Sorry, '{this.value}' is not valid. I'm looking for a 5 digit number as zipcode. Please specify a zipcode in the form 12345`

11. In `Validation Rules`, type:

    > validation rule 1 says we need a five characters

      `length(this.value) == 5`

    and then press enter.

    > Make sure to press enter to add the rule!

    Your properties pane should look like this:

    ![](../media/tutorial-weatherbot/03/zipcode-exceptions.png)

    And your flow should look like this:

    ![](../media/tutorial-weatherbot/03/zipcode-flow.png)

    With these options set, we have a dialog that will prompt the user for a zipcode. If the user gives a valid 5 digit zipcode, the prompt will store the value in `user.zipcode` and move on. If the user gives an invalid zipcode (e.g. `tomato` or `123456`), the prompt will present an error message and repeat until a valid response is received.

    > There are some options in the footer of the prompt properties that can be used to tune how the prompt works.

    > Max turn count can be used to control how many times the bot will reprompt after invalid responses.

    > By default, prompts will be skip if the bound property already has a value. Always prompt, when enabled, will cause the prompt to appear even if the value is already known. Leave this unchecked for now.

    After this action occurs, the bot can use `{user.zipcode}` in messages, and more importantly, in calls to external APIs!

## Add an HTTP request

The http request action is found under the `Access external resources >` menu in the flow "+" button.

1. Select `Send an HTTP request` to add a the step to your flow.

   ![](../media/tutorial-weatherbot/03/http-step.png)

2. In the properties editor,

   Set the method to `GET`

   Set the url to:    

      `http://weatherbot-ignite-2019.azurewebsites.net/api/getWeather?zipcode={user.zipcode}`

   Set the Result property to:

      `dialog.api_response`

   ![](../media/tutorial-weatherbot/03/http-props.png)

   This will cause the bot to make an HTTP request to the url specified. The reference to `{user.zipcode}` will be replaced by a live value from the bot's memory.

   > HTTP action sets the following information in the `Result property`: statusCode, reasonPhrase, content, headers. Setting the `Result property` to `dialog.api_response` means we can access those values via `dialog.api_response.statusCode`, `dialog.api_response.reasonPhrase`, `dialog.api_response.content` and `dialog.api_response.headers`. If the response is json, it will be a deserialized object available via `dialog.api_response.content`.

   After making an HTTP request, we need to test the status of the response. To do this, we'll use an If/Else branch.

3. Use the '+' button, then choose `Create a condition`, then choose  `Branch: If/Else`
4. In the property editor on the right, set the `condition` field to:

      `dialog.api_response.statusCode == 200`

5. In the `true` branch, use the "+" button, then select `Manage properties >`, then `Set a Property`

   Set Property to:
   
      `dialog.weather`

   Set Value to:

      `dialog.api_response.content`

   ![](../media/tutorial-weatherbot/03/set-property-condition.png)

6. Still in the `true` branch, use the "+" button, then select `Send a response`

   Set the text of the message to:
   
      `The weather is {dialog.weather.weather} and the temp is {dialog.weather.temp}&deg;`

   ![](../media/tutorial-weatherbot/03/ifelse.png)

7. Now, in the `false` branch, use the "+" button, then select `Send a response`

   Set the text of the message to:
   
      `I got an error: {dialog.api_response.content.message}`

8. To be safe, let's clean up the invalid value which otherwise would persist. Use the "+", select `Manage properties >`, then select `Delete a property`

   Set the property to:

      `user.zipcode`

   ![](../media/tutorial-weatherbot/03/ifelse2.png)


## Test in Emulator

1. Restart the bot again, and open it in emulator.

   ![](../media/tutorial-weatherbot/02/restart-bot.gif)

2. After the greeting, send `weather` to the bot. The bot will prompt you for a zipcode. Give it your home zipcode, and seconds later, you should see the current weather conditions!

   ![](../media/tutorial-weatherbot/03/basic-weather.gif)

   If you ask for the weather again, notice that the bot doesn't prompt for a zipcode the second time. Remember, this is because `user.zipcode` is already set. Had we checked `always prompt,` the bot would ask each time. Go back to step 10, check `Always prompt` and try again! Your bot will ask for a zipcode everytime you re-start the conversation in emulator.

## Next steps
- [Add help and cancel command](./bot-tutorial-add-help.md)
