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

#### `composer.usePassportStrategy(strategy)`

Configure a Passport strategy to be used by Composer. This is the equivalent of calling `app.use(passportStrategy)` on an Express app. [See PassportJS docs](http://www.passportjs.org/docs/configure/).

In addition to configuring the strategy, plugins will also need to use `composer.addWebRoute` to expose login, logout and other related routes to the browser.

Calling this method also enables a basic auth middleware that is responsible for gating access to URLs, as well as a simple user serializer/deserializer.  Developers may choose to override these components using the methods below.

#### `composer.useAuthMiddleware(middleware)`

Provide a custom middleware for testing the authentication status of a user. This will override the built-in auth middleware that is enabled by default when calling `usePassportStrategy()`.

Developers may choose to override this middleware for various reasons, such as:
* Apply different access rules based on URL
* Do something more than check `req.isAuthenticated` such as validate or refresh tokens, make database calls, provide telemetry, etc

#### `composer.useUserSerializers(serialize, deserialize)`

Provide custom serialize and deserialize functions for storing and retrieving the user profile and identity information in the Composer session.

By default, the entire user profile is serialized to JSON and stored in the session. If this is not desirable, plugins should override these methods and provide alternate methods. 

For example, the below code demonstrates storing only the user ID in the session during serialization, and the use of a database to load the full profile out of a database using that id during deserialization.

```
const serializeUser = function(user, done) {
  done(null, user.id);
};

const deserializeUser = function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
};

composer.useUserSerializers(serializeUser, deserializeUser);
```

#### `composer.addAllowedUrl(url)`

Allow access to `url` without authentication. `url` can be an express-style route with wildcards (`/auth/:stuff` or `/auth(.*)`)

This is primarily for use with authentication-related URLs. While `/login` is allowed by default, any other URL involved in auth needs to be whitelisted.

For example, when using oauth, there is a secondary URL for receiving the auth callback.  This has to be whitelisted, otherwise access will be denied to the callback URL and it will fail.

```
// define a callback url
composer.addWebRoute('get','/oauth/callback', someFunction);

// whitelist the callback
composer.addAllowedUrl('/oauth/callback');
```

#### `plugLoader.loginUri`

This value is used by the built-in authentication middleware to redirect the user to the login page.  By default, it is set to '/login' but it can be reset by changing this member value.

Note that if you specify an alternate URI for the login page, you must use `addAllowedUrl` to whitelist it.

### Storage

By default, Composer reads and writes assets to the local filesystem.  Plugins may override this behavior by providing a custom implementation of the `IFileStorage` interface. [See interface definition here](https://github.com/microsoft/BotFramework-Composer/blob/stable/Composer/packages/server/src/models/storage/interface.ts)

Though this interface is modeled after a filesystem interaction, the implementation of these methods does not require using the filesystem, or a direct implementation of folder and path structure. However, the implementation must respect that structure and respond in the expected ways -- ie, the `glob` method must treat path patterns the same way the filesystem glob would.

#### `composer.setStorage(customStorageClass)`

Provide an iFileStorage-compatible class to Composer.

The class is expected to be in the form:

```
class CustomStorage implements IFileStorage {
  constructor(conn: StorageConnection, user?: UserIdentity) {
    ...
  }
  
  ...
}
```

### Web Server

`composer.addWebRoute(method, url, callbackOrMiddleware, callback)`

`composer.addWebMiddleware(middleware)`


### Publishing

`composer.addPublishMEthod(name, publishMechanism)`

### Accessors

`composer.passport`

`composer.name`

## Plugin Roadmap

