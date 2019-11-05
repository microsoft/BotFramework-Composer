# Create an echo bot using Bot Framework Composer
In this quickstart will walk you through how to create a simple echo bot using the Bot Framework Composer **Echo Bot** template and then test it.

## Prerequisites
All of the prerequisites for creating an echo bot are included in [setup Composer with Yarn](./setup-yarn.md).

## Creating an echo bot
1. Follow the instructions in [setup Composer with Yarn](./setup-yarn.md) to get Composer running. 
After opening in a browser click the **Echo Bot** button at the top of the Examples list on the homepage.

![homepage new button](./media/tutorial-echobot/echo-new.png)

2. Fill in the **Name** with `EchoBot` and copy `This is a simple echo bot. It echoes back the user's response.` to the **Description** box. Choose where you want to save the bot and click **Next**.

![echo bot details](./media/tutorial-echobot/tutorial-echo-setup.png)

3. You will now see your bot's main dialog. In the Property panel on the right click the dropdown under **Recognizer Type** and select `None`. Since this is a simple echo bot you don't need to use any [recognizers](./concept-events-and-triggers-draft.md#regular-expression-recognizer#regular-expression-recognizer) or [LUIS](https://aka.ms/what-is-luis) models.

![set recognizer type](./media/tutorial-echobot/select-none-recognizer.gif)

4. You're now ready to start and test your bot. Click **Start Bot** in the top right. You will then see the **Test in Emulator** button show up. Click that and Bot Framework Emulator should start.

![start bot](./media/tutorial-echobot/start-bot.gif)

5. Type anything in the Emulator to have the bot echo back your response.

![test in emulator](./media/tutorial-echobot/test-emulator.gif)

You've successfully created an echo bot!  

## Next Steps
Create a [weather bot](tutorial/bot-tutorial-introduction.md) using Composer.

