# anatomy of a dialog

Dialogs contain event handlers.

Most dialogs will contain one important thing: a handler for the BeginDialog event.  This happens automatically whenever the dialog is called into action.

Inside the BeginDialog go the actions that should fire immediately, ever time the dialog starts.

## other types of events

Cancel - IF you use the cancelalldialogs call, you may want to catch that event to provide a confirmation.

## Interuption


## Child Dialogs

## Root Dialog