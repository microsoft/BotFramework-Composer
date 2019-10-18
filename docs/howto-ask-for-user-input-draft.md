# Asking for user input
Bot Framework Composer makes it easier than ever to not only collect and validate a variety of data types, and handle instances when users input invalid or unrecognized data. The [Messages_Samples bot](https://github.com/microsoft/BotFramework-Composer/tree/master/SampleBots/Message_Samples/ComposerDialogs) has examples of all of the prompt types and is referenced throughout this article. Below is a screenshot of the options in the **Ask a question** menu:

![Ask a question menu screenshot]()

## Prompt types
Bot Framework Composer currently has six types of prompts you can utilize to collect user data along with validation for each type. For information about prompting for OAuth credentials read [Using OAuth](). 

### Prompt for text
Prompt users for their name, favorite color, or any other text data using `Prompt for text`. To prompt a user for text click the **+** button, mouse over **Ask a question** and select **Prompt for text**. 

![Select prompt for text]()

As seen in the **TextInput** dialog the user is prompted for their name and the result is stored in property as `user.name`. Notice on the right there are 

### Prompt for number
Prompt users for their age and other numerical values using `Prompt for number`. To prompt a user for a number click the **+** button, mouse over **Ask a question** and select **Prompt for number**. 

![Select prompt for number]()

### Prompt for confirmation
Confirmation prompts are useful after you've asked the user a question, prompt or otherwise, and want to confirm their choice. To create a confirmation prompt click the **+** button, mouse over **Ask a question** and select **Prompt for confirmation**. 

![Select prompt for confirmation]()

### Prompt for multi-choice
`Prompt for multi-choice` makes it easy to define a set of choices for users to choose from. To create a prompt with multiple choice options click the **+** button, mouse over **Ask a question** and select **Prompt for multi-choice**. 

![Select prompt for multi-choice]()

### Prompt for Attachment
Users can upload images, videos, and other media after being prompted with a `Prompt for attachment`. To prompt a user for an attachment click the **+** button, mouse over **Ask a question** and select **Prompt for attachment**.

![Select prompt for attachment]()

### Prompt for date
Prompt users for their birthday, the date they want to travel, and other dates using the `Prompt for date`. To prompt a user for a date click the **+** button, mouse over **Ask a question** and select **Prompt for date**.

![Select prompt for date]()

## Further Reading

## NEXT
TBD