# Bot Framework Composer Plugins

It is possible to extend and customize the behavior of Composer by installing plugins.
Plugins can hook into the internal mechanisms of Composer and change they way they operate.
Plugins can also "listen to" the activity inside Composer and react to it.

## What is a Composer plugin?

Composer plugins are Javascript modules. When loaded into Composer, the module is given access
to a set of Composer APIs which can then be used by the plugin to provide new functionality to the application.
Plugins do not have access to the entire Composer application - in fact, they are granted limited access
to specific areas of the application, and must adhere to a set of interfaces and protocols.

## Plugin Endpoints

Plugins currently have access to the following functional areas:

* Authentication and identity - plugins can provide a mechanism to gate access to the application, as well as mechanisms used to provide user identity. 
* Storage - plugins can override the built in filesystem storage with a new way to read, write and access bot projects.
* Web server - plugins can add additional web routes to Composer's web server instance.
* Publishing - plugins can add publishing mechanisms

Combining these three endpoints, it is possible to achieve scenarios such as:

* Store content in a database
* Require login via AAD or any other oauth provider
* Create a custom login screen
* Require login via Github, and use Github credentials to store content in a Git repo automatically
* Use AAD roles to gate access to content
* Publish content to external services such as remote runtimes, content repositories, testing systems, etc.

## How to build a plugin

Plugin modules must come in one of the following forms:
* Default export is a function that accepts the Composer plugin API
* Default export is an object that includes an `initialize` function that accepts the Composer plugin API
* A function called `initialize` is exported from the module

Currently, plugins can be loaded into Composer using 1 of 2 methods:
* The plugin is placed in the /plugins/ folder, and contains a package.json file with `extendsComposer` set to `true`
* The plugin is loaded directly via changes to Composer code, using `pluginLoader.loadPlugin(name, plugin)`

The simplest form of a plugin module is below:

```
export default async (composer: any): Promise<void> => {

  // call methods (see below) on the composer API
  // composer.setStorage(...);
  // composer.usePassportStrategy(...);
  // composer.addWebRoute(...)

}
```

### Authentication and identity

To provide auth and identity services, Composer has in large part adopted [PassportJS](https://passportjs.org) instead of implementing a custom solution.
Plugins can use one of the [many existing Passport strategies](http://www.passportjs.org/packages/), or provide a custom strategy.

`composer.usePassportStrategy(strategy)`


`composer.useAuthMiddleware(middleware)`

`composer.useUserSerializers(serialize, deserialize)`

`composer.addAllowedUrl(url)`

`PlugLoader.loginUri`

### Storage

`composer.setStorage(customStorageClass)`

### Web Server

`composer.addWebRoute(method, url, callbackOrMiddleware, callback)`

`composer.addWebMiddleware(middleware)`


### Publishing

`composer.addPublishMEthod(name, publishMechanism)`

### Accessors

`composer.passport`

`composer.name`

## Plugin Roadmap

