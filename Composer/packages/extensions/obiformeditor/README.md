# obiformeditor

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

Describe obiformeditor here.

[build-badge]: https://img.shields.io/travis/user/repo/master.png?style=flat-square
[build]: https://travis-ci.org/user/repo

[npm-badge]: https://img.shields.io/npm/v/npm-package.png?style=flat-square
[npm]: https://www.npmjs.org/package/npm-package

[coveralls-badge]: https://img.shields.io/coveralls/user/repo/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/user/repo

[react-jsonschema-form]: https://github.com/mozilla-services/react-jsonschema-form

#### Playground

There is a playground to see and experiment with all of the different OBI types. This is usually helpful to view
outside of Composer because it gives you a finer grain of control and allows you to drill down into any level of detail easily.

In the Composer directory or in the obiformeditor directory:
```bash
yarn start
```

You can now access the playground at http://localhost:3001

To see your changes in Composer:

1. Build `yarn build`
2. Refresh Composer.


#### React JSON Schema Form

This is a light wrapper around [react-jsonschema-form](react-jsonschema-form). It is possible that changes will need to be made
in our fork of the project. When doing so, use the steps outlined below.

##### Development

In your local react-jsonschema-form directory:
```bash
yarn link
# make changes
npm run dist
```

In this directory:
```bash
yarn link react-jsonschema-form
# test changes
yarn unlink react-jsonschema-form
```

##### Upgrading

Once you are done making changes, commit them and push.
Then merge those changes into the [composer branch](https://github.com/a-b-r-o-w-n/react-jsonschema-form/tree/composer).
Once merged, update the package version by incrementing the number after the actual package version (ex. `1.4.0-1` -> `1.4.0-2`).
Create a tag with the new version number (`git tag v1.4.0-2`) and push to git.
Finally, update the tag in obiformeditor package.json to reference the newly created tag.
