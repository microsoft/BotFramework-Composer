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

After obtaining the choice from the user click the **+** button underneath the choice prompt (in the sample it is after a **Send an Actvity** that echos back the user's choice.) Mouse over **Flow** and select **Branch: Switch**.
<img>

 You should now see an empty **Branch: Switch** box and a diamond underneath with the word **default** next to it. Click on the box and you will see on the right pane a field labeled **Condition**. This is the condition we're going to evaluate on, and in this instance our condition is `user.name`.
 <img>

 Underneath the **Condition** field there is a button labeled **Add a New Case**. This is where you add what action(s) the bot takes for each of the options in the choice prompt. Click the **Add a New Case** and add one of the name choices (Tom, Nick, or Susan). Repeat this for all name options.
<img>

Once you've added a branch for a name you'll see a **Add a New Action for <name>** button. Click on that button or the **+** button next to the name to add an action for the bot to run if that condition is met.
<img>

 Once you've added all of your cases and actions your Switch branch is ready. 

## Loop: For Each
For Each loops are useful for situations where you want the bot to iteratively loop through items in a list and have the bot perform and action on each item.

To create a new list by click the **+** arrow, mouse over **Memory manipulation**, and select **Initialize a Property**.
<img>

On the right side you will see boxes for Property and Type. Add the name of your property (`dialogs.list` in this sample) and set Type to **array**.
<img>

Now you need to add items to the list. Click the **+** button, mouse over **Memory manipulation** and select **Edit an Array Property**.
<img>

 On the right you will see **Change Type**, **Array Property**, **Result Property**, and **Value of the Item**. Set the change type to **Push** since you want to add items to the list, the **Array Property** to `dialogs.id` since this is the list you are iterating over, and the **Value of the Item** to what you want added to the list. **Value of the Item**.
 <img>

 After all items are pushed to the list you can start iterating through thm with **For Each** loop. Click the **+** button, mouse over **Flow** and select **Loop: For Each**.
 <img>

 On the right you will see boxes for the three elements you need to run a for each loop:
 - **List Property**: the list you want to iterate over.
 - **Value Property**: the memory path that refers to the item in the list
 - **Index Property**: the memory path that refers to the index of an item in the list.

 Set **List Property** to `dialogs.id`, **Value Property** to `dialog.value`, and **Index Property** to `dialog.index`. 
 <img>

 After setting the properties you then decide what action your bot should perform in the list. In this sample the bot sends the user the index of the item (`dialog.index`) and the value of the item (`dialog.value`).
 <img> 

## Loop: For Each Page
**For Each Page** loops are useful for situations in which you want to loop through a large list one page at a time. Like **For Each** loops your iterates through a list, but the difference is that **For Each Loops** executes actions per item page instead of per item in the list.


To add a **For Each Page Loop** first make sure that you have a list to iterate over. For more information about making a list click [here](link to list making).

 Click on the **+** button, mouse over **Flow** and click **Loop: For Each Page**.
<img>

On the right you will see the following:
- **List Property**: the list to iterate over. In the sample this is set to `dialogs.id`.
- **Page Size**: the number of items in a page. The default value is 10.
- **Value Property**: the memory path of item in list. In the sample this is set to `dialog.value`.
<img>

After setting the aforementioned values your **For Each Page** loop is ready. As seen in the sample, you can call a for **For Each** loop after calling each page. This will cause your bot to loop through all the items in one page and take an action before handling to the next page.
<img>

## Dialogs: End Turn
If you want to end the current turn click the **+** arrow underneath the point you want to end the turn, mouse over **Dialogs**, and click **End Turn**.
<img>

## Dialogs: Repeat Dialog
If you want to repeat a dialog click the **+** arrow underneath the point you want to continue, mouse over **Dialogs**, and click **Repeat this Dialog**. 


handle unknown intent
handle conversation update
handle a dialog event

