# How to update the schema file

Once the bot has been setup with Composer and we wish to make changes to the schema, the first step in this process is to eject the runtime through the `Runtime Config` in Composer. The ejected runtime folder will broadly have the following structure

```
bot
  /bot.dialog
  /language-generation
  /language-understanding
  /dialogs
     /customized-dialogs
  /runtime
  /schemas
     sdk.schema
```

##### Prequisites

Botframework CLI > 4.10

```
npm i -g @microsoft/botframework-cli
```

> NOTE: Previous versions of botframework-cli required you to install @microsoft/bf-plugin. You will need to uninstall for 4.10 and above.
>
> ```
> bf plugins:uninstall @microsoft/bf-dialog
> ```

## Adding Custom Actions to your Composer bot for C#

**NOTE: These steps assume you are using azurewebapp as your deployment solution. Replicating it on azurefunctions would be similar
**

- In this tutorial, we will be going over the steps to include a custom action `MultiplyDialog` that multiplies two numbers passed as inputs. Note that the ejected runtime should contain a `customaction` folder that has this sample.

- Navigate to the csproj file inside the `runtime` folder (bot/runtime/azurewebapp/Microsoft.BotFramework.Composer.WebApp.csproj) and include a project reference to the customaction project like `<ProjectReference Include="..\customaction\Microsoft.BotFramework.Composer.CustomAction.csproj" />`.

- Then Uncomment line 28 and 139 in azurewebapp/Startup.cs file so as to register this action.

```

using Microsoft.BotFramework.Composer.CustomAction;
// This is for custom action component registration.
ComponentRegistration.Add(new CustomActionComponentRegistration());

```

- Run the command `dotnet build` on the azurewebapp project to verify if it passes build after adding custom actions to it.

- Navigate to to the `schemas (bot/schemas)` folder. This folder contains a Powershell script and a bash script. Run either of these scripts `./update-schema.ps1 -runtime azurewebapp` or `sh ./update-schema.sh -runtime azurewebapp`. The runtime `azurewebapp` is chosen by default if no argument is passed.

- Validate that the partial schema (MultiplyDialog.schema inside customaction/Schema) has been appended to the default sdk.schema file to generate one single consolidated sdk.schema file.

The above steps should have generated a new sdk.schema file inside `schemas` folder for Composer to use. Reload the bot and you should be able to include your new custom action!

## Adding Custom Actions to your Composer bot for Node.js

- In this tutorial, we will be going over the steps to include a custom action `MultiplyDialog` that multiplies two numbers passed as inputs. Note that the ejected runtime should contain a `customaction` folder that has this sample.

- Uncomment line 30 and 61 in src/shared/composerBot.ts file so as to register this action.

```

import { CustomActionComponentRegistration } from '../customaction/customActionComponentRegistration';
// This is for custom action component registration, uncomment this to enable custom action support.
ComponentRegistration.add(new CustomActionComponentRegistration());

```

- Run the command `npm run build` on the runtime to verify if it passes build after adding custom actions to it.

- Rename the MultiplyDialog.schema.sample to MultiplyDialog.schema

- Navigate to to the `schemas (bot/schemas)` folder. This folder contains a Powershell script and a bash script. Run either of these scripts `./update-schema.ps1` or `sh ./update-schema.sh`.

- Validate that the partial schema (MultiplyDialog.schema inside customaction) has been appended to the default sdk.schema file to generate one single consolidated sdk.schema file.

The above steps should have generated a new sdk.schema file inside `schemas` folder for Composer to use. Reload the bot and you should be able to include your new custom action!

## Customizing Composer using the UI Schema

Composer's UI can be customized using the UI Schema. You can either customize one of your custom actions or override Composer defaults.

There are 2 ways to do this.

1. **Component UI Schema File**

To customize a specific component, simply create a `.uischema` file inside of the `/schemas` directory with the same name as the component, These files will be merged into a single `.uischema` file when running the `update-schema` script.

Example:

```json
// Microsoft.SendActivity.uischema
{
  "$schema": "https://schemas.botframework.com/schemas/ui/v1.0/ui.schema",
  "form": {
    "label": "A custom label"
  }
}
```

2. **UI Schema Override File**

This approach allows you to co-locate all of your UI customizations into a single file. This will not be merged into the `sdk.uischema`, instead it will be loaded by Composer and applied as overrides.

Example:

```json
{
  "$schema": "https://schemas.botframework.com/schemas/ui/v1.0/ui.schema",
  "Microsoft.SendActivity": {
    "form": {
      "label": "A custom label"
    }
  }
}
```

#### UI Customization Options

UI Schema includes four parts:
1. Form
2. Menu
3. Flow
4. Trigger
5. Recognizer

For the full JSON Schema definition of them, please reference to the SDK repo: https://github.com/microsoft/botframework-sdk/blob/main/schemas/ui/v1.0/ui.schema.

##### 1. Form

| **Property** | **Description**                                                                        | **Type**            | **Default**          |
| ------------ | -------------------------------------------------------------------------------------- | ------------------- | -------------------- |
| description  | Text used in tooltips.                                                                 | `string`            | `schema.description` |
| helpLink     | URI to component or property documentation. Used in tooltips.                          | `string`            |                      |
| hidden       | An array of property names to hide in the UI.                                          | `string[]`          |                      |
| label        | Label override. Can either be a string or false to hide the label.                     | `string` \| `false` | `schema.title`       |
| order        | Set the order of fields. Use "\_" for all other fields. ex. ["foo", "_", "bar"]        | `string[]`          | `[*]`                |
| placeholder  | Placeholder override.                                                                  | `string`            | `schema.examples`    |
| properties   | A map of component property names to UI options with customizations for each property. | `object`            |                      |
| subtitle     | Subtitle rendered in form title.                                                       | `string`            | `schema.$kind`       |
| widget       | Override default field widget. See list of widgets below.                              | `enum`              |                      |

###### Available Form Widgets

- checkbox
- date
- datetime
- input
- number
- radio
- select
- textarea

##### 2. Menu

Menu UI Schema describes how an Action $kind appears in the contextual menu.

| Property | Description | Type | Default |
|----------| ----------- | ---- | ------- |
| label | Text that appears as the menu item. | `string` | Defaults to SDK title. |
| submenu | An array of submenu labels to configure how this component is nested in the menu. Set to false to show this component as a top-level menu item. | `string` | |
| disabled | Hide this Action from creation menu | `boolean` | `false` |

##### 3. Flow
Flow UI Schema describes how an Action $kind appears in the flow canvas.

| Property | Description | Type | Default |
|----------| ----------- | ---- | ------- |
| widget | Name of the React widget that used to render this Action. | `string` | |
| *...props* | Property of the `widget`. Used as React props. Expression is supproted. | `any` | |

For more information of how to write customize an Action node, please refer to [this link](TBD).

##### 4. Trigger

Trigger UI Schema describes how an Trigger $kind appears in the Trigger creation wizard.

| Property | Description | Type | Default |
|----------| ----------- | ---- | ------- |
| label | Displayed trigger name in trigger creation flow. | string | Defaults to SDK title. |
| submenu | An array of submenu labels to configure how this component is nested in the menu. Set to false to show this component as a top-level menu item. | `string[]` | |
| disabled | Hide this Trigger from creation wizard. | `boolean` | `false` |

##### 5. Recognizer
Recognizer UI Schema describes how an Recognizer $kind appears in the Recognizer Type dropdown.

| Property | Description | Type | Default |
|--|--|--|--|
| displayName | Recognizer name displayed in the dropdown option. | `string` | Defaults to be SDK title. |
| intentEditor | Name of the React widget to edit recognizer intents. | `string` | |
| default | When set to true, new dialogs will use this recognizer by default. | `boolean` | Defauts to be `false` |
| disabled | When set to true, the recognizer will be hidden from the dropdown. | `boolean` | Defaults to be `false` |

