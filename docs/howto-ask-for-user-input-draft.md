# Asking for user input
Bot Framework Composer makes it easier than ever to not only collect and validate a variety of data types, and handle instances when users input invalid or unrecognized data. The [Messages_Samples bot](https://github.com/microsoft/BotFramework-Composer/tree/master/SampleBots/Message_Samples/ComposerDialogs) has examples of all of the prompt types and is referenced throughout this article. Below is a screenshot of the options in the **Ask a question** menu:

![Ask a question menu screenshot]()

## Prompt types
Bot Framework Composer currently has six types of prompts you can utilize to collect user data. For information about prompting for OAuth credentials read [Using OAuth](). 

### Prompt for text
Prompt users for their name, favorite color, or any other text data using `Prompt for text`. To prompt a user for text click the **+** button, mouse over **Ask a question** and select **Prompt for text**. 

![Select prompt for text]()

As seen in the **TextInput** dialog the user is prompted for their name and the result is stored in property as `user.name`. Change the **Output Format** if you want to trim the text (remove leading and trailing whitespace), make it lowercase, or make it uppercase.

![Properties and format Text Prompt]()

### Prompt for number
Prompt users for their age and other numerical values using `Prompt for number`. To prompt a user for a number click the **+** button, mouse over **Ask a question** and select **Prompt for number**. 

![Select prompt for number]()

As seen in the **NumberInput** dialog the user is prompted for the results of `2*2.2` and their results is stored as a `user.result`. The **Output Format** is set to float (), but it can also be stored as an integer. 

![Properties and format Number Prompt]()

### Prompt for confirmation
Confirmation prompts are useful after you've asked the user a question, prompt or otherwise, and want to confirm their choice. To create a confirmation prompt click the **+** button, mouse over **Ask a question** and select **Prompt for confirmation**. 

![Select prompt for confirmation]()

As seen in the ConfirmInput dialog the bot asks the user "yes or no" as the **Initial Prompt** and the **Property** as `user.confirmed`.

### Prompt for multi-choice
`Prompt for multi-choice` makes it easy to define a set of choices for users to choose from. To create a prompt with multiple choice options click the **+** button, mouse over **Ask a question** and select **Prompt for multi-choice**. 

![Select prompt for multi-choice]()

In the **ChoiceInput** dialog you will see the **Property** is set to `user.style`. The Output Format is set to **value** (the value of the list item) as opposed to index (index of the list item), and the **List Style** is set to **List**. The table below shows how the choices are displayed with each list option:

<list option table>
none
auto
inline
list
suggested action
hero card

Below the `Default Locale` box you set the values of the choice options by clicking the **Add** button. You can also set synonyms that users can type that will also activate a specific choice. 

![Add multi-choice]()

Note that if you select the **Inline** list style you can scroll down and set **Inline Separator** (character to separate between list items), **Inline Or** (separator for just two choices) and **Inline OrMore** (separator for last items of a list larger than two).

![choice options multi-choice]()

### Prompt for Attachment
Users can upload images, videos, and other media after being prompted with a `Prompt for attachment`. To prompt a user for an attachment click the **+** button, mouse over **Ask a question** and select **Prompt for attachment**.

![Select prompt for attachment]()

In the **AttachmentInput** dialog you will see the **Property** is set to `dialog.attachments`. The **Output Format** is set to `first`, meaning only the first attachment will be output. 

### Prompt for date
Prompt users for their birthday, the date they want to take a flight, and other dates using the `Prompt for date`. To prompt a user for a date click the **+** button, mouse over **Ask a question** and select **Prompt for date**.

![Select prompt for date]()

## Prompt validation and unrecognized responses 
Prompts in the Bot Framework Composer come with methods to validate prompt responses and deal with instances where users supply a reponse that is invalid or unrecognized.



## Further Reading

## NEXT
TBD