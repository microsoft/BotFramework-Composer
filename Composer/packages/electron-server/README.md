# Composer Electron

## Summary

This package is a wrapper that will spin up the Composer web application inside of an [Electron](https://www.electronjs.org/) shell to provide an installable, cross-platform version of Composer that runs directly on your desktop.

## How to Build & Run

### Prerequisites

1. Make sure all dependencies are installed by performing a `yarn install` in the `/Composer/` directory.
2. Make sure all packages are built by performing a `yarn build` in the `/Composer/` directory.

### Run from Source (Development)

1. Run `yarn start` in the `/Composer/packages/client` directory.
2. Run `yarn start` in the `/Composer/packages/electron-server` directory.

### Build a packaged executable

**Method 1**

1. Run `yarn dist:full` in the `/Composer/package/electron-server` directory.
2. Find your portable binary inside of `/Composer/package/electron-server/dist`.

----

**Method 2**

1. Run `yarn run pack` in the `/Composer/package/electron-server` directory.
2. Run `yarn copy-templates` in the `/Composer/package/electron-server` directory.
3. Run `yarn copy-extensions` in the `/Composer/package/electron-server` directory.
4. Run `yarn dist`in the `/Composer/package/electron-server` directory.
5. Find your portable binary inside of `/Composer/package/electron-server/dist`.
