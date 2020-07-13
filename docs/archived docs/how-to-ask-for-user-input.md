# Asking for user input
Bot Framework Composer makes it easier to collect and validate a variety of data types, and handle instances when users input invalid or unrecognized data. The [AskingQuestionsSample](https://github.com/microsoft/BotFramework-Composer/tree/main/Composer/packages/server/assets/projects/AskingQuestionsSample) has examples of all of the prompt types and is referenced throughout this article. Below is a screenshot of the options in the **Ask a Question** menu in Composer:

![prompt menu](./media/memory/ask-a-question-menu.png)

## Prompt types
Composer currently has seven prompts you can utilize to collect user data. <!---For information about prompting for OAuth credentials, see [Using OAuth]().-->

### Text
Prompt users for their name, favorite color, and other text data using **Text input**. To prompt a user for text click the **+** button under your trigger, mouse over **Ask a Question** and click **Text input**.

![Select prompt for text](./media/ask-for-input/select-text-prompt.png)

As seen in the **TextInput** dialog the user is prompted for their name in the **Prompt** box in the **Bot Asks** section in the Propery panel.

![Text prompt bot says](./media/ask-for-input/text-bot-asks.png)

The user's response is stored in **Property to fill** in the **User Input** section as `user.name`. Note that you can change the **Output Format** if you want to save the text as trimmed (leading and trailing whitespace removed), uppercase, or lowercase.

![Text prompt user input](./media/ask-for-input/text-user-input.png)

### Number
Prompt users for their age and other numerical values using **Number input**. To prompt a user for a number click the **+** button under your trigger, mouse over **Ask a Question** and click **Number input**.

![Select prompt for number](./media/ask-for-input/select-number-prompt.png)

As seen in the **NumberInput** dialog the user is prompted for two numbers: their age stored as `user.age` and the result of `2*2.2`stored as a `user.result`. When using number prompts you can set the **Output Format** to either `float` or `integer`.

![Number prompt dialog](./media/ask-for-input/number-dialog.png)

### Confirmation
Confirmation prompts are useful after you've asked the user a question, prompt or otherwise, and want to confirm their choice. Unlike **Multiple choice** prompt which allows bots to ask users for an answer out of a set, confirmation prompts ask the user to make a binary decision. To create a confirmation prompt click the **+** button under your trigger, mouse over **Ask a Question** and click **Confirmation**.

![Select prompt for confirmation](./media/ask-for-input/select-confirmation-prompt.png)

As seen in the ConfirmInput dialog the bot asks the user "yes or no" as the **Initial Prompt** and the **Property to fill** as `user.confirmed`. In the **User Answers** section in the Property panel you will notice **Confirm Options**, which can be used to set how to output your confirmation options and set synonyms. You generally do not need to change these setting for confirmation prompts.

### Multiple choice
**Multiple choice** makes it easy to define a set of choices for users to choose from. To create a prompt with multiple choice options click the **+** button under your trigger, mouse over **Ask a Question** and click **Multiple choice**.

![Select prompt for multi-choice](./media/ask-for-input/select-multiple-choice-prompt.png)

In the **ChoiceInput** dialog you will see the **Property to fill** is set to `user.style`, the **Output Format** is set to `value` (meaning the value, not the index will be used) the **locale** is set to `en-us`, and the **List style** is set to `Auto`. The locale sets the language the recognizer should expect from the user (US English in this sample). The **List style** sets the style for how the choice options are displayed. The table below shows the differences in appearance for the three choices:

| List style       | Appearance                                                                            | Description                                                                    |
| ---------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| None             | ![list none](./media/ask-for-input/multichoice-list-none.png)                         | displays none of the options                                                   |
| Auto             | ![list auto](./media/ask-for-input/multichoice-list-auto.png)                         | displays options with autoformatting, usually buttons                          |
| Inline           | ![list inline](./media/ask-for-input/multichoice-list-inline.png)                     | displays options using inline separators set in **User Answers**               |
| List             | ![list list](./media/ask-for-input/multichoice-list-list.png)                         | displays options as list, or a numbered list if **Include numbers** is checked |
| Suggested Action | ![list suggested action](./media/ask-for-input/multichoice-list-suggestedactions.png) | displays options as Suggested Action buttons                                   |
| Hero Card        | ![list hero card](./media/ask-for-input/multichoice-list-herocard.png)                | displays Hero Card with options as buttons **within** card                     |

In the **User Input** section in the properties panel you will notice **Choice Options**, which can be used to add more choices and their synonyms. You can set the choice options in **Static** or **Dynamic** format. For **Static** format, you need to write each choice option manually; for **Dynamic** format, you can set the options to an array and then retrieve the value dynamically.

You'll also see three boxes related to inline separation, or how your bot separates the text of your choices:
  - **Inline separator** - character used to separate individual choices when there are more than two choices, usually `,`.
  - **Inline or** - separator used when there are only two choices, usually `or`.
  - **Inline or more** - separator between last two choices when there are more than two options, usually `, or`.

![Multichoice choice and inline options](./media/ask-for-input/choice-and-inline.png)

You'll also see boxes for **Include numbers** which should be checked if you want your list of options to be numbered, and **Append choices**, which composes an output activity containing the set of choices. Both of these are checked in the sample.

### File or attachment
Users can upload images, videos, and other media after being prompted with **File or attachment**. To prompt a user for an attachment click the **+** button under your trigger, mouse over **Ask a Question** and click **File or attachment**.

![Select prompt for attachment](./media/ask-for-input/select-attachment-prompt.png)

In the **AttachmentInput** dialog you will see the **Property to fill** is set to `dialog.attachments`. You can set the **Output Format** to`first` (only the first attachment will be output) or `all` (all attachments will be output).

### Date or time
Prompt users for their birthday, the date they want to take a flight, and other dates using **Date or time**. To prompt a user for a date click the **+** button under your trigger, mouse over **Ask a Question** and click **Date or time**.

![Select prompt for date](./media/ask-for-input/select-datetime-prompt.png)

In the **DateTimeInput** dialog you will see the **Property to fill** is set to `user.date` and the **Default locale** is set to `en-us`.

## Prompt settings
Prompts in the Composer come with components to validate prompt responses and deal with instances where users supply a response that is invalid or unrecognized. **Prompt Settings** can be found on the bottom of the Property panel and contain the following settings:

- **Max turn count**: maximum number of re-prompt attempts before the default value is selected.
- **Default value**: the value to return if the expression cannot be validated.
- **Allow interruptions**: boolean that determines whether parent should be able to interrupt child dialog
- **Always prompt**: collect information even if specified property isn't empty.

![Prompt settings](./media/ask-for-input/settings.png)

## Other
Composer simplified reprompting when users fail to input data that is invalid and of the correct type. The following in the **Others** tab to the right of **User Answers** in the Property panel are used to deal with the above situations:

- **Unrecognized Prompt**:  message to send to a user if their response was not recognized
- **Validation Rules**: [Common Expression Language](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/common-expression-language) rules used to validate the user's response
- **Invalid Prompt**:  message to respond with when a user inputs an invalid data type, like a number instead of a date
- **Value**: gets or sets expression used to initialize the input prompt
- **Default Value Response**: message to send when max turn count has been hit and default value is selected

![Prompt Exceptions](./media/ask-for-input/other.png)

## Next
- Learn how to [manage conversation flow](./how-to-control-conversation-flow.md) using conditionals and dialogs.
