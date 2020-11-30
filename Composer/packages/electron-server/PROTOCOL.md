# `bfcomposer://` Protocol

## Summary

The desktop (Electron) version of Bot Framework Composer allows us to register a special protocol URL: `bfcomposer://`. The user's operating system will then route any URLs starting with this protocol directly to Composer to be handled properly.

This allows Composer to do things like deep link directly into a bot, process certain file types, and initiate any Composer-driven activities from outside of the application.

Below you will find documentation of the currently implemented protocol routes.

## Reference

> NOTE: All parameter values must be URL encoded

### `import`

Imports bot content from an external source (Power Virtual Agents, Azure, etc.) into Composer and allows the user to save it to a new or existing bot project.

**Parameters:**

- `source` - The identifier for the external source that the bot content is being downloaded from
- `payload` - A stringified JSON object containing metadata from the external source that is needed to download the bot content

**Example:**

`bfcomposer://import?source=pva&payload=%7B%22url%22%3A%22https%3A%2F%2Fwww.importme.com%2Fimport%22%2C%22username%22%3A%22johndoe1%22%7D`

---

### `open`

Navigates to a specific location within a Composer bot project. This could be a specific dialog, or a trigger / action within a specific dialog.

**Parameters:**

- `url` - The URL to append to the base URL within Composer that will deep link into a bot project.

**Example:**

`bfcomposer://open?url=bot%2F88524.65932484581%2Fdialogs%2Fdeleteitem%3Fselected%3Dtriggers%5B0%5D%26focused%3Dtriggers%5B0%5D.actions%5B0%5D&test=ab`

---

### `create`

Navigates to the bot project creation wizard within Composer with a specific template and optionally a selected schema, name, and description for the project.

**Parameters:**

- `schemaUrl` (optional) - An application schema to apply to the template assets
- `description` (optional) - A description for the bot that will prepopulate the "description" text field within the creation wizard
- `name` (optional) - A name for the bot that will prepopulate the "name" text field within the creation wizard

**Example:**

`bfcomposer://create/EchoBot?schemaUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fmicrosoft%2Fbotframework-sdk%2Fmain%2Fschemas%2Fcomponent%2Fcomponent.schema&description=Hello%20description&name=my-bot-name`

