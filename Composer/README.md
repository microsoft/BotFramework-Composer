[![Build Status](https://github.com/microsoft/BotFramework-Composer/workflows/Composer%20CI/badge.svg?branch=main)](https://github.com/microsoft/BotFramework-Composer/actions?query=branch%3Amain)
[![Coverage Status](https://coveralls.io/repos/github/microsoft/BotFramework-Composer/badge.svg?branch=main)](https://coveralls.io/github/microsoft/BotFramework-Composer?branch=main)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/microsoft/BotFramework-Composer.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/microsoft/BotFramework-Composer/alerts/)

# Composer

The web app that can edit bots in OBI format, and can use Bot Launcher to run bot.

### Instructions

Prerequisite:

- node > 14
- yarn // npm install -g yarn

To build for hosting as site extension

```cmd
set PUBLIC_URL=/composer
```

Commands:

```
$ cd Composer
$ yarn install
$ yarn build
$ yarn startall
```

then go to http://localhost:3000/, best experienced in Chrome

If you run into the issue of `There appears to be trouble with your network connection. Retrying...` when running `yarn install`, plese run `yarn install --network-timeout 1000000` instead to bypass the issue.

## Documentation

The documentation for Composer [can be found here](/toc.md).
