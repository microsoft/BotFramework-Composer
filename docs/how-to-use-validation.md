# Linting and validation

As an integrated development tool, Bot Framework Composer supports validation of data when you author [.lg](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md) files, [.lu](https://github.com/Microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md) files, and [expressions](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/common-expression-language) to fill in property fields. Error indicators will show in both inline editors and corresponding all-up views (**Bot Responses** and **User Input**). The **Notifications** page (click **Notifications** icon on the left navigation pane) displays an aggregation of all errors and warnings. With the help of linting and validation, your bot-authoring experience will be improved and you can easily build a functional bot that can "run".  

> [!NOTE]
> We are still working to improve the implementation of linting and validation in Composer. More user scenarios will be updated. 

When you see `Start Bot` button in grey, this indicates your bot has errors that prevent it from running successfully. 

![start-grey](./media/validation/start-grey.png)

The number beside the error icon indicates the number of errors. Click the error icon you will be navigated to the **Notifications** page listing all errors and warnings.  

![notification-all-up-view](./media/validation/notification-all-up-view.png)

Click any of the errors on the **Notifications** page will navigate you to the matching error location. After you fix all the errors, you will see the `Start Bot` button in blue, this indicates your bot has no errors and it will run successfully. 

## .lg 
When you author an [.lg file](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md) that has syntax errors, an indicator will show in the inline editor with a red wiggling line. See the screenshot below: 

![inline-error-lg](./media/validation/inline-error-lg.png)

To diagnose and fix the error, you can read the error message beneath the editor and click `here` to refer to the syntax documentation. You can also hover your mouse over the erroneous part and read the detailed error message with suggested fixes. See the screenshot below: 

![hover-message-lg](./media/validation/hover-message-lg.png)

Click **Bot Responses** on the left navigation pane, you will find the error also syncs up in the lg all-up view. The tiny red rectangle on the right end of the editor helps you to identify where the error is. This is especially helpful when you have a long list of templates. Hover your mouse over the erroneous part you will see detailed error message with suggested fixes. 

![lg-all-up-view](./media/validation/lg-all-up-view.png)


## .lu files
When you author an [.lu file](https://github.com/Microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md) that has syntax errors, the entire lu editor will be in red frame. See the screenshot below: 

![lu-inline-error](./media/validation/lu-inline-error.png)

To diagnose and fix the error, you can read the error message beneath the editor and click `here` to refer to the syntax documentation. 

<!-- See the screenshot below: 

![hover-message-lu](./media/validation/hover-message-lu.png) -->

<!-- Click **User Input** on the left navigation pane, you will find the error also syncs up in the lu all-up view.

![lu-all-up-view](./media/validation/lu-all-up-view.png) -->


## Expression
When you fill in property fields with [expressions](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/common-expression-language) that have syntax errors, the entire editor frame will be in red. See the screenshot below: 

![expression-inline-error](./media/validation/expression-inline-error.png)

To diagnose and fix the error, you can read the error message beneath the editor and click `here` to refer to the syntax documentation. 

<!-- ## Missing condition  -->




