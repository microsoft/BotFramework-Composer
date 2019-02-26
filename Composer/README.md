# Composer
The web app that can edit bots in OBI format, and can use Bot Launcher to run bot.

### Instructions

prerequisite:
* node > 8.0
* yarn         // npm install -g yarn
* concurrently // npm install -g concurrently

in this folder

```
$ yarn install // install dependencies
$ yarn start // start clien and server at the same time
```

then go to http://localhost:3000/, best experienced in Chrome 

### Extensions
Composer is built with an extension system, this project shows samples of the extension system

#### What's an extension for
An extention is used to provide an editor for a certain type of bot content. It can be .lu, .lg, .dialog, etc.

All editors are loaded as extensions.

Non-editor extensions are not supported at this time, though the mechanisms for providing extensions will scale outside the dialog editor's.

#### What's an extension? what's in it
Composer is managed via yarn workspaces, producing such a folder layout. 
```
|- Composer
  |- package.json  // define the workspaces
  |- packages      
    |- client       // composer main app
    |- server       // composer api server
    |- extensions
      |- sample-json-edior // sample extension package
```

Each extension is a standalone React component pacakge under Composer's `/packages/extensions` folder. 

Each extension is registered as dependency of the `client` package in `/packages/client/package.json`.

After `yarn install` the path would look like: 

`/node_modules/@composer-extensions/sample-json-editor`
==> `/packages/extensions/sample-json-editor`

An extension should produce a single React component that can render 1..N editors that it wants to provide an editing experience for.

### Why React componnet?  

There are many options to choose when picking an abstraction for an extension. Different level abstractions have different impacts on many aspects, like developing, testing, debuging and running the extension. 

A low-level abstraction like HTML page will give us perfect isolation, great flexibilty (use whatever language you want to build that), but usually result in a relatively high amount of effort to develop a robust api between host and extension because it's using the low-level messaging primitives, and also not good for performance because of the extreme isolation. 

A high-level abstraction like React component, will cost a little bit on isolation, but gain the best support from a mature and powerful framework, in every cycle of the development of extensions. It will help most of boosting the productivity, simplifying the architecure, and gain the best performance. 

Based on our scenario, we will use React as a start point, and host the extension in an `<IFrame>` to gain a certain level of isolation, for two major reasons:
 
* we favor produtivity, simplicity, performance at this point over extreme isolation, more choices when developing extensions. We don't expect there are so many extension developers like VS Code . :)  
* we can always go low-level whenever we see fit, all extensions will still work then, not but visa-verse


### How an extension is discovered, registered, loaded, & hosted

#### registration

After registering an extension as dependency of `client` package, the client package will be able import the React component this pacakge exposed. 

The client pacakge has an `ExtensionMap` module to manage the mapping from `dialog asset type` => `registered editor`.

One can simply by modify `/packages/client/ExtensionMap.js` to add the mapping, like

```
ExtensionMap.js

import JsonEditor from '@composer-extensions/sample-json-editor'

var map = {
    '.lu': JsonEditor   // make JsonEditor handle .lu files
}

```

#### discovery 

When Composer starts up and a Dialog is selected to be inspected, Composer looks up this mapping to find the appropriate editor to load for the Dialog. Full list of Dialog types to configure Editors for are TBD.

#### loading

The loading of the extension is totally controlled by composer, common loading patterns (lazy, prefetch) can be utilized but is not a concern of the extension.

Here in this protoype, we showed how a typical lazy-loading process looks like:

When the composer starts up, composer will try to read all bot assets, starting from the .bot file, then resolve all it's dependencies. And list all files into the sidebar on the left.

When user click a ".lu" file, the composer knows which extension can handle this ".lu" file, based on the mapping produced by `ExtensionMap`. The Composer sends a signal to the mounted Extension and an appropriate payload to give it the data and interface it needs for Composer to edit the current Dialog.

Loading an editor in the json-schema sense is the following:

1. Edit sends a signal to the Extension that it is time to render, and a payload representing the current `formData`
2. Extension loads its schemas `schema`, `uiSchema` (descriptions on what and how the form is the be rendered) with the given `formData`
3. On change of a value in a form control, we construct a not-yet-saved Dialog that when saved persists it to the Bot asset. Saving conventions are not yet defined, but could be a debounced auto-save, or save on demand, etc.

#### hosting

Extensions are gauranteed to be hosted in an isolated (from the main composer window) container, like `<iframe />`. 

Communication between the Composer and the extension is using the React conventions: props, since we assume an extension is an React component. 

### data in\out story

Using React convention make the API extremly simple and easy. 

We define two props that all extension will receive and use
* value: any
* onChange: (newValue:any) => void

as the name say, value is for Composer to pass data in, onChange is for extension to pass data out.

This is how usually an extension is embedded: 
```
<JsonEditor value={this.value} onChange={this.onChange}>
```

Composer will gurantee those two props are passed, and gurantee onChange will save data, but don't gurantee this data is persisted. 

More interface can be defined as props. Such as 
* ReadFile
* Alert
* Prompt

Those are some common requirements from an extension perspective. All of them can be easily defined as props. Detailed prop list are TBD.

### Dialog editing

If the field being edited is part of a parent Dialog, we may need to provide an alert allowing the user to let us know if the intention is to edit the base Dialog or create a new dialog with this edited override. (business requirement needed). If the user chooses to modify the base dialog, this will update all Dialogs that currently inhereit from it.

### extending an extension

As designed, the Extension is sealed to its current React Component implementation. If during a design session one wanted to add a property on a Dialog configured to a particular Extension that was not supported by the Editors current schema, this would require a new schema, which would map to a new Editor type.
