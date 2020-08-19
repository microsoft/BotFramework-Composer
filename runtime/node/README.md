# Node.js bot launcher for Azure WebApp and Azure Functions

# Folder structure

- **shared**: Includes all core JavaScript runtime logic, independent of hosting technology.
- **webapp**: server code for azure webapp services
- **functions** server code for azure functions
- **__tests__**: Javascript runtime tests

# Installation before use

For all users need to install npm before start composer.

## for windows users

 * user need to install `windows-build-tools` before start composer. By running `npm install --global windows-build-tools`. Otherwise it may throw `gyp build Err` during npm install, because we use `restify` as server and its dependency `dtrace-provider` need `gyp` to build.

## for Mac users
 * user need to have `xcode-select` before start composer. Otherwise it may throw `gyp build Err` during npm install. You can install or re-install it by running `sudo rm -rf $(xcode-select -print-path)`, `xcode-select --install` then `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`
