# Controlling conversation flow
Bot Framework Composer makes it easier than ever to control the flow of conversation between bots and users. This article will show you how to control conversation flow using the [ControllingConversation sample](https://github.com/microsoft/BotFramework-Composer/tree/master/SampleBots/ControllingConversation).

## Branch: If/Else
Creating and If/Else branch is useful when you want users to make a binary decision. The bot will carry out actions depending on if the condition was met or not.

Say you want to obtain a user's age and verify that their age is equal to or greater than 18. You start by prompting the user for their age. Click the **+** button underneath the trigger in your dialog and mouse over **Ask a Question**. Click **Prompt for number**.
<img>

Set the name of the **property** as `user.age`.
<img>

Now click the **+** under number prompt and mouse over the **Flow** option. Select **Branch: If/Else**.
<img>

You should see a diamond shape with **True** and **False** branches. In the **Condition** box on the Branch pane on right add the expression `user.age >= 18`. 
<img>

Now you need to decide what you want the bot to do if the **True** condition is satisified and the user is 18 or older, or if the **False** condition if the user is under 18. In this sample the bot simply states if the user's age is satisfactory.

## Branch: Switch
Switch is used for situations in which you want users to select one choice out a set of given options

For example, you want to ask a user what their name is out of a set of names: Susan, Nick, and Tom. You first ask the user their name using a choice prompt (Ask a Question > Prompt for multi-choice) and store that property as `user.name`.
<img>

After obtaining the choice from the user click the **+** button underneath the choice prompt (in the sample it is after a **Send an Actvity** that echos back the user's choice.) Mouse of **Flow** and select **Branch: Switch**.
<img>

 You should now see an empty **Branch: Switch** box and a diamond underneath with the word **default** next to it. Click on the box, and you will see on the right pane a field labeled **Condition**. This is the condition we're going to evaluate on, and in this instance our condition is `user.name`.
 <img>

 Underneath the **Condition** field there is a button labeled **Add a New Case**. This is where you add what actions the bot should take for each of the options in the choice prompt. Click the **Add a New Case** and add one of the name choices (Tom, Nick, or Susan). 


## For each
For each <> are useful for situations where you want the bot to iteratively 

## For each page
cancel

## Dialogs: End Turn
If you want to end the current turn click the **+** arrow underneath the point you want to end the turn, mouse over **Dialogs**, and click **End Turn**. 

## Dialogs: Repeat Dialog
If you want to repeat a dialog click the **+** arrow underneath the point you want to continue, mouse over **Dialogs**, and click **Repeat this Dialog**. 

handle unknown intent
handle conversation update
handle a dialog event

