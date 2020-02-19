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


## How to build a plugin


## Plugin Roadmap

