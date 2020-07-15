[![Build Status](https://github.com/microsoft/BotFramework-Composer/workflows/Composer%20CI/badge.svg?branch=main)](https://github.com/microsoft/BotFramework-Composer/actions?query=branch%3Amain)
[![Coverage Status](https://coveralls.io/repos/github/microsoft/BotFramework-Composer/badge.svg?branch=main)](https://coveralls.io/github/microsoft/BotFramework-Composer?branch=main)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/microsoft/BotFramework-Composer.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/microsoft/BotFramework-Composer/alerts/)

# Composer
The web app that can edit bots in OBI format, and can use Bot Launcher to run bot.

### Instructions

Prerequisite:
* node > 12
* yarn         // npm install -g yarn

To build for hosting as site extension

```cmd
set PUBLIC_URL=/composer
```

Commands:
```
$ cd Composer
$ yarn install
$ yarn build
$ yarn startall
```
then go to http://localhost:3000/, best experienced in Chrome

If you run into the issue of `There appears to be trouble with your network connection. Retrying...` when running `yarn install`, plese run `yarn install --network-timeout 1000000` instead to bypass the issue.

## Documentation
The documentation for Composer [can be found here](/toc.md).

## Extension Framework
Composer is built on top of an extension framework, which allows anyone to provide an extension as the editor of certain type of bot assets.

All editors, 1st party or 3rd party, are loaded in the same way by the extension framework.

Non-editor extensions are not supported at this time, though the mechanisms for providing extensions will scale outside the dialog editor's.

### What's an extension? what's in it
Each extension is a standalone React component package ([why React component](#why-react-component)) under Composer's `/packages/extensions` folder, which implements the extension `interface`.

Composer is managed via yarn workspaces, producing such a folder layout.
```
|- Composer
  |- package.json  // define the workspaces
  |- packages
    |- client       // composer main app
    |- server       // composer api server
    |- extensions
      |- package.json  // put all extension as one package
      |- adaptive-form // dialog property editor
    |- lib
      |- shared        // shared code
```

All extensions under `/extensions` folder will be eventually packed into one `extensions` package, then the `client` package will depends on this `extensions` package.

### Extension Interface
The extension interface defines the way how an extension comminutes to the host.

In React world, interface means the props passed into a component. An extension will be passed ino 3 props:
- data:any. which is the data to be edited by this editor.
- onChange: (newData) => void. which is the callback enables an editor to save the edited data.
- [shellApi](#shell-api). which is a set of apis providing other capabilities than data in\out.

The rendering code of an extension will be sth like this:
```
  import SomeEditor from 'someplace'

  <SomeEditor data={..}, onChange={...}, shellApi={...}>
```

#### data in\out story

With this interface, it's pretty clear how data is in\out extension. Data is passed in through `data` prop, and been saved with `onChange` prop.

#### shell api

Shell api is a set of apis that provides other important functionalities that empower an extension to provide a more powerful and smooth editing experience. including

* OpenSubEditor
  ```
  openSubEditor(location:string, data:any, onChange:(newData:any) => void)
  ```
  This is the most important api that support a [multiple editors](#multiple-editors) scenario, which allows an editor to delegate some editing task to another editor, and listen the changes.

  Note that, this api doesn't allow you to specify the type or the name of the sub editor. You only get to specify a data, the shell will use a centralized way to manage how editors are registered and picked up. See registration section in the below for more details.

  We may suppport other forms of openSubEditor later, but we expect this is the mosted used one.

* ObjectGraph

  TBD, this will be an api that enable each extension have the knowledge of a global object graph.
* Alert
* ReadFile
* Prompt

### Why React component

There are many options to choose when picking an abstraction for an extension. Different level abstractions have different impacts on many aspects, like developing, testing, debuging and running the extension.

A low-level abstraction like HTML page will give us perfect isolation, great flexibilty (use whatever language you want to build that), but usually result in a relatively high amount of effort to develop a robust api between host and extension because it's using the low-level messaging primitives, and also not good for performance because of the extreme isolation.

A high-level abstraction like React component, will cost a little bit on isolation, but gain the best support from a mature and powerful framework, in every cycle of the development of extensions. It will help most of boosting the productivity, simplifying the architecure, and gain the best performance.

Based on our scenario, we will use React as a start point, and host the extension in an `<IFrame>` to gain a certain level of isolation, for two major reasons:

* we favor produtivity, simplicity, performance at this point over extreme isolation, more choices when developing extensions. We don't expect there are so many extension developers like VS Code . :)
* we can always go low-level whenever we see fit, all extensions will still work then, not but visa-verse


### How an extension is discovered, registered, loaded, & hosted

#### registration

Inside the client package, there is an `EditorMap` module to manage the mapping from `dialog asset type` => `registered editor`.

The extension registration is done by modifying `/Composer/packages/client/src/extension-container/EditorMap.js` to add an entry in the registration table

```
ExtensionMap.js

const EditorRegistration = [
    {
        when: (data) => getSuffix(data.name) === ".dialog",
        pick: FormEditor
    },

    {
        when: (data) => getSuffix(data.name) === ".lu",
        pick: JsonEditor
    },

    {
        when: (data) => true,
        pick: JsonEditor
    }
]

```

As you can see in above, editors are registered in such an registration table with each entry includes two properties:
* when. A lamdba that tests whether this kind of data is interested or not
* pick. The target extenion type to be picked up.

In this design, we treat file the same way as any json object, by wrapping it into an data object, such as
```
 {
   name: "xx.lu",
   content: "file content"
 }
```

With this unification into a data object and a lambda on top of that, it's simple, powerful and flexible to define extension at any level of content.

#### discovery

In the runtime, each time an data is to be edited, the shell will go through the table, run the condition of each entry, and pick a proper editor for that.

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


### Dialog editing

If the field being edited is part of a parent Dialog, we may need to provide an alert allowing the user to let us know if the intention is to edit the base Dialog or create a new dialog with this edited override. (business requirement needed). If the user chooses to modify the base dialog, this will update all Dialogs that currently inhereit from it.

### extending an extension

As designed, the Extension is sealed to its current React Component implementation. If during a design session one wanted to add a property on a Dialog configured to a particular Extension that was not supported by the Editors current schema, this would require a new schema, which would map to a new Editor type.

## multiple editors

This section will explain how multiple editors are supported in details, including how editors are organized in a hierachy way, how data is bubbled up from children to parent, then to shell, etc.
