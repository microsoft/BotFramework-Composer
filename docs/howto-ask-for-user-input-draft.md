# Asking for user input
Bot Framework Composer makes it easier than ever to collect and validate a variety of data types, and handle instances when users input invalid or unrecognized data. The [Asking-Questions-Sample](https://github.com/microsoft/BotFramework-Composer/tree/master/SampleBots/Message_Samples/ComposerDialogs) has examples of all of the prompt types and is referenced throughout this article. Below is a screenshot of the options in the **Ask a Question** menu:

![prompt menu](./media/ask-for-input/prompt-menu.png)

## Prompt types
Bot Framework Composer currently has six types of prompts you can utilize to collect user data. For information about prompting for OAuth credentials read [Using OAuth](). 

### Prompt for text
Prompt users for their name, favorite color, and other text data using **Text input**. To prompt a user for text click the **+** button under your trigger, mouse over **Ask a Question** and click **Text input**. 

![Select prompt for text](./media/ask-for-input/select-text-prompt.gif)

As seen in the **TextInput** dialog the user is prompted for their name in the **Prompt** box in the **Bot Asks** section in the Propery panel.

![Text prompt bot says](./media/ask-for-input/text-bot-asks.png)

The user's response is stored in **Property to fill** in the **User Asks** section as `user.name`. Note that you can change the **Output Format** if you want to save the text as trimmed (leading and trailing whitespace removed), uppercase, or lowerase. 

![Text prompt user says](./media/ask-for-input/text-user-answers.png)

### Prompt for number
Prompt users for their age and other numerical values using **Number input**. To prompt a user for a number click the **+** button under your trigger, mouse over **Ask a Question** and click **Number input**. 

![Select prompt for number](./media/ask-for-input/select-number-prompt.gif)

As seen in the **NumberInput** dialog the user is prompted for two numbers: their age stored as `user.age` and the result of `2*2.2`stored as a `user.result`. When using number prompts you can set the**Output Format** to either `float` or `integer`.  

![Number prompt dialog](./media/ask-for-input/number-dialog.png)

### Prompt for confirmation
Confirmation prompts are useful after you've asked the user a question, prompt or otherwise, and want to confirm their choice. Unlike **Prompt for multi-choice** which allows bots to ask users for an answer out of a set, confirmation prompts ask the user to make a binary decision. To create a confirmation prompt click the **+** button under your trigger, mouse over **Ask a Question** and click **Confirmation**. 

![Select prompt for confirmation](./media/ask-for-input/select-confirmation-prompt.gif)

As seen in the ConfirmInput dialog the bot asks the user "yes or no" as the **Initial Prompt** and the **Property to fill** as `user.confirmed`. In the **User Answers** section in the Property panel you will notice **Confirm Operations**, which can be used to 
  - add synonyms of yes and no?
  - what is point of inline if there are only binary options? 
  
### Prompt for multiple choices
**Multiple choice** makes it easy to define a set of choices for users to choose from. To create a prompt with multiple choice options click the **+** button under your trigger, mouse over **Ask a Question** and click **Multiple choice**. 

![Select prompt for multi-choice](./media/ask-for-input/select-multichoice-prompt.gif)

In the **ChoiceInput** dialog you will see the **Property to fill** is set to `user.style`, the **Output Format** is set to `value` (meaning the value, not the index will be used) the **locale** is set to `en-us`, and the **List style** is set to `Auto`. The locale sets the language the recognizer should expect from the user (US English in this sample). The **List style** sets the style for how the chocie options are displayed. The table below shows the differences in appearance for the three choices:

| List style | Appearance | Description |
|---|---|---|
| None | ![list none](./media/ask-for-input/multichoice-list-none.png)| displays none of the options |
| Auto | ![list auto](./media/ask-for-input/multichoice-list-auto.png)| displays options with autoformatting, usually buttons |
| Inline | ![list inline](./media/ask-for-input/multichoice-list-inline.png) | displays options using inline separators set in **User Answers** |
| List | ![list list](./media/ask-for-input/multichoice-list-list.png)| displays options as list, or a numbered list if **Include numbers** is checked |
| Suggested Action | ![list suggested action](./media/ask-for-input/multichoice-list-suggestedactions.png) | displays options as Suggested Action buttons|
| Hero Card | ![list hero card](./media/ask-for-input/multichoice-list-herocard.png)| displays Hero Card with options as buttons **within** card|

In the **User Answers** section in the Property panel you will also notice **Choice Options**, which can be used to add more choices and their synonyms. You'll also see three boxes related to inline separation, or how your bot separates the text of your choices:
  - **Inline separator** - character used to separate individual choices when there are more than two choices, usually `,`.
  - **Inline or** - separator used when there are only two choices, usually `or`.
  - **Inline or more** - separator between last two choices when there are more than two options, usually `, or`. 

![Multichoice choice and inline options](./media/ask-for-input/choice-and-inline.png)

You'll also see boxes for **Include numbers** which should be checked if you want your list of options to be numbered, and **Append choices**, which composes an output activitity containing the set of choices. Both of these are checked in the sample.

### Prompt for file or attachment
Users can upload images, videos, and other media after being prompted with **File or attachment**. To prompt a user for an attachment click the **+** button under your trigger, mouse over **Ask a Question** and click **File or attachment**.

![Select prompt for attachment](./media/ask-for-input/select-attachment-prompt.gif)

In the **AttachmentInput** dialog you will see the **Property to fill** is set to `dialog.attachments`. You can set the **Output Format** to`first` (only the first attachment will be output) or `all` (all attachments will be output).  

### Prompt for date or time
Prompt users for their birthday, the date they want to take a flight, and other dates using **Date or time**. To prompt a user for a date click the **+** button under your trigger, mouse over **Ask a Question** and click **Date or time**.

![Select prompt for date](./media/ask-for-input/select-datetime-prompt.gif)

In the **DateTimeInput** dialog you will see the **Property to fill** is set to `user.date` and the **Default locale** is set to `en-us`.

## Prompt settings
Prompts in the Bot Framework Composer come with components to validate prompt responses and deal with instances where users supply a reponse that is invalid or unrecognized. **Prompt Settings** can be found on the bottom of the Property panel and contain the following settings:

- **Max turn count**: maximum number of re-prompt attempts before the default value is selected.
- **Default value**: the value to return if the expression cannot be validated.
- **Allow interruptions**: boolean that determines whether parent should be able to interrupt child dialog
- **Always prompt**: collect information even if specified property isn't empty. 

![Prompt settings](./media/ask-for-input/settings.png)

## Exceptions
Exceptions are useful for situations where users fail to input data that is invalid and of the correct type. You will find the following **Exceptions** to the right of **User Answers** in the Property panel:

- **Unrecognized Prompt**:  message to send to a user if their response was not recognized.
- **Invalid Prompt**:  message to respond with when a user inputs an invalid data type, like a number instead of a date.
- **Validation Rules**: [Common Expression Language](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/common-expression-language) rules used to validate the user's response
- **Default Value Response**: message to send when max turn count has been hit and default value is selecte

![Prompt Exceptions](./media/ask-for-input/exceptions.png)

## Further Reading
TBD

## Next
Learn how to [manage conversation flow]() using conditionals and dialogs.
