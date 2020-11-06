# Enabling Authentication via OneAuth

## Summary

Authentication in Composer is done using the OneAuth native node library.

This library leverages APIs within the user's OS to store and retrieve credentials in a compliant fashion, and allows Composer to get access tokens on behalf of the user once the user signs in.

We disable this authentication flow by default in the development environment. To use the flow in a dev environment, please follow the steps below to leverage the OneAuth library.

## Requirements

**NOTE:** Authentication on Linux is not (yet) supported. We plan to support this in the future.

When building Composer from source, in order to leverage the OneAuth library you will need to:

- Set the `COMPOSER_ENABLE_ONEAUTH` environment variable to `true` in whatever process you use to start the `electron-server` package
- Install the `oneauth-win64` or `oneauth-mac` NodeJS module either manually from the private registry, or by downloading it via script

## Installing the OneAuth module

Depending on your OS (Mac vs. Windows), you will need to install the `oneauth-mac` or `oneauth-win64` modules respectively.

### Using the `installOneAuth.js` script

1. Set `npm_config_registry` to `https://office.pkgs.visualstudio.com/_packaging/OneAuth/npm/registry/`
1. Set `npm_config_username` to anything other than an empty string
1. Set `npm_config__password` (note the double "_") to a base64-encoded [Personal Access Token you created in Azure DevOps](https://office.visualstudio.com/_usersSettings/tokens) for the Office org that has the Packaging (read) scope enabled
1. Run `node scripts/installOneAuth.js` from `/electron-server/`

There should now be a `/electron-server/oneauth-temp/` directory containing the contents of the OneAuth module which will be called by Composer assuming you set the `COMPOSER_ENABLE_ONEAUTH` environment variable.
