# Node.js bot launcher for Azure WebApp and Azure Functions

# Folder structure

- **shared**: Includes all core JavaScript runtime logic, independent of hosting technology.
- **webapp**: server code for azure webapp services
- **functions** server code for azure functions
- **__tests__**: Javascript runtime tests

# Installation before use

For all users need to install npm before start composer.

## for windows users

 * user need to install `windows-build-tools` before start composer. By running `npm install --global windows-build-tools`. Otherwise it may throw `gyp Err` during npm install.

## for linux users
 * user need to install `xcode-select` before start composer. By running `xcode-select --install`
