# Composer Electron

## Summary

This package is a wrapper that will spin up the Composer web application inside of an [Electron](https://www.electronjs.org/) shell to provide an installable, cross-platform version of Composer that runs directly on your desktop.

## How to Build & Run

### Prerequisites

1. Make sure all dependencies are installed by performing a `yarn install` in the `/Composer/` directory.
1. Make sure all packages are built by performing a `yarn build` in the `/Composer/` directory.

### Development

1. Run `yarn start` in the `/Composer/packages/client` directory.
1. Run `yarn start` or `yarn start:dev` in the `/Composer/packages/server` directory.
1. Run `yarn start` in the `/Composer/packages/electron-server` directory.

### Production (Create a portable binary)

**Method 1**

1. Run `yarn dist:full` in the `/Composer/package/electron-server` directory.

----

**Method 2**

1. Run `yarn copy-templates` in the `/Composer/package/electron-server` directory.
1. Run `yarn run pack` in the `/Composer/package/electron-server` directory. 
1. Run `yarn copy-plugins` in the `/Composer/package/electron-server` directory.
1. Run `yarn dist`in the `/Composer/package/electron-server` directory.
1. Find your portable binary inside of `/Composer/package/electron-server/dist`.
