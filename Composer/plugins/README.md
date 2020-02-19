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
  // composer.useStorage(...);
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

#### PluginLoader.getUserFromRequest(req)`

This is a static method on the PluginLoader class that extracts the user identity information provided by Passport.
This is for use in the web route implementations to get user and provide it to other components of Composer.

For example:

```
const RequestHandlerX = async (req, res) => {

  const user = await PluginLoader.getUserFromRequest(req);

  // ... do some stuff

};
```


### Storage

By default, Composer reads and writes assets to the local filesystem.  Plugins may override this behavior by providing a custom implementation of the `IFileStorage` interface. [See interface definition here](https://github.com/microsoft/BotFramework-Composer/blob/stable/Composer/packages/server/src/models/storage/interface.ts)

Though this interface is modeled after a filesystem interaction, the implementation of these methods does not require using the filesystem, or a direct implementation of folder and path structure. However, the implementation must respect that structure and respond in the expected ways -- ie, the `glob` method must treat path patterns the same way the filesystem glob would.

#### `composer.useStorage(customStorageClass)`

Provide an iFileStorage-compatible class to Composer.

The constructor of the class will receive 2 parameters: a StorageConnection configuration, pulled from Composer's global configuration (currently data.json), and a user identity object, as provided by any configured authentication plugin. 

The current behavior of Composer is to instantiate a new instance of the storage accessor class each time it is used. As a result, caution must be taken not to undertake expensive operations each time. For example, if a database connection is required, the connection might be implemented as a static member of the class, inside the plugin's init code and made accessible within the plugin module's scope.

The user identity provided by a configured authentication plugin can be used for purposes such as:

* provide a personalized view of the content
* gate access to content based on identity
* create an audit log of changes

If an authentication plugin is not configured, or the user is not logged in, the user identity will be `undefined`.

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

Plugins can add routes and middlewares to the Express instance.

These routes are responsible for providing all necessary dependent assets such as browser javascript, css, etc.

Custom routes are not rendered inside the front-end React application, and currently have no access to that application. They are independent pages -- though nothing prevents them from making calls to the Composer server APIs.

#### `composer.addWebRoute(method, url, callbackOrMiddleware, callback)`

This is equivalent to using `app.get()` or `app.post()`. A simple route definition receives 3 parameters - the method, url and handler callback.

If a route-specific middleware is necessary, it should be specified as the 3rd parameter, making the handler callback the 4th.

Signature for callbacks is `(req, res) => {}`

Signature for middleware is `(req, res, next) => {}`

For example:

```
// simple route
composer.addWebRoute('get', '/hello', (req, res) => {
  res.send('HELLO WORLD!');
});

// route with custom middleware
composer.addWebRoute('get', '/logout', (req, res, next) => {
    console.warn('user is logging out!');
    next();
  },(req, res) => {
    req.logout();
    res.redirect('/login');
});
```

#### `composer.addWebMiddleware(middleware)`

Bind an additional custom middleware to the web server. Middleware applied this way will be applied to all routes.

Signature for middleware is `(req, res, next) => {}`

For middleware dealing with authentication, plugins must use `useAuthMiddleware()` as otherwise the built-in auth middleware will still be in place.

### Publishing

#### `composer.addPublishMethod(publishMechanism)`

Provide a new mechanism by which a bot project is transferred from Composer to some external service. The mechanisms can use whatever method necessary to process and transmit the bot project to the desired external service, though it must use a standard signature for the methods.

In most cases, the plugin itself does NOT include the configuration information required to communicate with the external service. Configuration is provided by the Composer application at invocation time.

Once registered as an available method, users can configure specific target instances of that method on a per-bot basis. For example, a user may install a "Publish to PVA" plugin, which implements the necessary protocols for publishing to PVA. Then, in order to actually perform a publish, they would configure an instance of this mechanism, "Publish to HR Bot Production Slot" that includes the necessary configuration information.

Publishing plugins support the following features:

* publish - given a bot project, publish it. Required.
* getStatus - get the status of the most recent publish. Optional.
* getHistory - get a list of historical publish actions. Optional.
* rollback - roll back to a previous publish (as provided by getHistory). Optional.

##### publish(config, project, user)

##### getStatus(config, user)

##### getHistory(config, user)

##### rollback(config, versionIdentifier, user)


### Accessors

`composer.passport`

`composer.name`

## Plugin Roadmap

These features are not currently implemented, but are planned for the near future:

* Eventing - plugins will be able to emit events as well as respond to events emitted by other plugins and by Composer core.

* Front-end plugins - plugins will be able to provide React components that are inserted into the React application at various endpoints.

* Schema extensions - Plugins will be able to amend or update the schema.

