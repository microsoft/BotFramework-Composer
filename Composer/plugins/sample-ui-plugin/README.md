# How to Write a Plugin that Hosts Custom UI (React)

## Overview

One aspect of Composer is its extension system which allows developers to write independent JavaScript packages that can be plugged into Composer and call APIs to provide new or modify current functionality within the application.

Each extension will consist of a NodeJS module that will be called by Composer as the initial contact point at which the extension will declare what parts of Composer it will extend.

Additionally, Composer allows these extensions to host custom UI -- in the form of a bundled React application -- at select surfaces we call "contribution points."


Below, we will explain how you, as a developer, can author your own extension that hosts custom UI within Composer at one of these contribution points.

## Configuring package.json

The first thing that you need to do when authoring a Composer extension is to configure the `package.json` properly. In order to do this, you will need to fill out the following top-level properties in the `package.json`:

**`extendsComposer`** - boolean

This property must be set to `true` in order for Composer to recognize it as an extension.

---

**`composer`** - object

This property will contain the rest of the configuration options for your Composer extension. This will specify things like what contribution points your extension will host custom UI at, and which bundled JavaScript files (your React applications) to load in order to do so.

In the future, we expect the possibilities of this property to grow and change.

---

**`composer.bundles`** - array

The `composer.bundles` property is an array of objects specifying which bundles your extension will provide to Composer in order to host your custom UI. Each entry in the array will specify an `id` for the bundle, and also a relative `path` to the bundle (relative to your `package.json`).

For example, let's say you have created an extension that will host a custom UI that you have created. You have bundled your React application into a single JavaScript file located at `/<your-project-name>/dist/bundle.js`. You will now edit your `package.json` file at `/<your-project-name>/package.json` to include the following:

`package.json`
```
{
  "name": "your-project-name",
  ...
  "composer": {
    "bundles": [
      {
        "id": "my-bundle",
        "path": "./dist/bundle.js"
      }
    ]
  }
}
```
This might not seem very useful by itself, but combined with the `composer.contributes` property, this let's Composer know where to look for your React app's bundle when trying to load your custom UI.

---

**`composer.contributes.views`** - object

The `composer.contributes.views` property is an object that allows you to specify which contribution points inside of Composer you want to display custom UI for.

Each key inside of the `views` property represents one of the contribution points that an extension can provide custom UI for.

The current valid contribution points are: `page` and `publish`. More will be available in the future.

`package.json`
```
{
  "name": "your-project-name",
  ...
  "composer": {
    "views": {
      "page": {
        // specify page contribution point configration here
      },
      "publish": {
        // specify publish contribution point configuration here
      }
    }
  }
}
```

Each `view.<contribution-point>` property will specify a `bundleId` property that correlates to the `id` property of the desired React app bundle to display at that contribution point as specified in the `composer.bundles` array.

Adding on to the example that we used in the `composer.bundles` section:


`package.json`
```
{
  "name": "your-project-name",
  ...
  "composer": {
    "bundles": [
      {
        "id": "my-bundle",
        "path": "./dist/bundle.js"
      }
    ]
    "views": {
      "publish": {

        // telling Composer to display bundled React app at ./dist/bundle.js
        // inside of the publish contribution point surface
        "bundleId": "my-bundle"
      }
    }
  }
}
```

Depending on the contribution point, the `view.<contribution-point>` property might also allow other configuration properties besides `bundleId` that will affect each contribution point differently.

> Look at `/sample-ui-plugin/package.json` as an example

## Bundling Extension Client Code

Currently, Composer only allows the hosting of bundled React applications.

### React

**React** (or ReactJS) is a JavaScript framework that allows developers to build complex UI. You can learn more [here](https://reactjs.org/).

### Bundling

**Bundling** is the process of compiling all the NodeJS modules required by your application into one, or multiple JavaScript files. Some bundling tools even allow your NodeJS modules to be run inside of a browser environment, which is especially useful for client code and front end applications such as a React app.

Composer currently supports a single JavaScript bundle for each contribution point an extension wishes to provide UI for, and this section will cover how to configure Webpack to create such a bundle. Webpack is a popular bundling tool, and you can learn more about it [here](https://webpack.js.org/).

### Webpack Configuration

In order to configure Webpack to create a bundle suitable for Composer, your `webpack.config.js` needs to include a few special options that omit React and ReactDOM from being bundled into your JavaScript file. This might seem counterintuitive, but Composer will provide these two libraries when we host your React app, and it will reduce the overall size of your bundle.

In order to accomplish this, add the following top level property to your configuration:

`webpack.config.js`
```
module.exports = {
  entry: {
    ...
  },

  // rest of your config that compiles your app into a bundle
  ...,

  // omit React & ReactDOM
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  }
};
```

What this `externals` object does, is instead of pulling React and ReactDOM from `import` or `require` statements, Webpack will modify your compiled JavaScript to instead access these libraries via global variables named `React` and `ReactDOM` that are available in the browser context. These will be provided by Composer when your extension's custom UI is hosted within a contribution point.

> Look at `/sample-ui-plugin/webpack.config.js` as an example

## Registering Extension via NodeJS Module

Finally, for your extension to be registered with Composer, you will need to provide a NodeJS module with an initialize function that can be called by Composer to bootstrap your extension.

As an example, let's create our NodeJS module:

`index.js`
```
// this will be called by Composer
function initialize(registration) {
  const plugin = {
    customDescription: 'Publish using custom UI',
    hasView: true, // we have custom UI to host
    publish,
    getStatus,
  };

  // let Composer know that we are providing our own Publishing plugin
  registration.addPublishMethod(plugin);
}

async function getStatus(config, project, user) {
  // get publish status

  // return result
}

async function publish(config, project, metadata, user) {
  // start publish

  // return result
}

module.exports = {
  initialize,
};
```

The `initialize` function will automatically be called by Composer when it tries to load your extension. You can also export a default function, and Composer will try to call that.

The `initialize` function receives an argument, `registration`, that Composer passes to the extension in order to register certain modifications to functionality. In this case, our extension is adding a publish method, and has specified that we also have custom UI to display by setting the `hasView` property on our `plugin` object to `true`.

The last thing we need to do, is specify this NodeJS module as the entry point inside of our `package.json`:

`package.json`
```
{
  "name": "your-project-name",
  ...
  "main": "index.js"
}
```

When Composer tries to load your extension, it will use this `main` property to locate the correct file to call.

> Look at `/sample-ui-plugin/src/node/index.ts` as an example

## Sample

To see a working sample in action, just navigate to `/sample-ui-plugin/package.json` in this directory and change the `extendsComposer` property to `true`, and the `composer.contributes.views.page-DISABLED` key to `page`.

Then restart the Composer server.

To see the **publish plugin** in action, open a bot project, select "Publish" in the left nav bar, click "Add a new profile," and select "Publish using custom UI."

To check out the **page plugin**, simply click the question mark icon in the left nav bar of Composer, and it should render a page with a labeled input field.


