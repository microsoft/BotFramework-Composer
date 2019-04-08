# obieditortest

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

Describe obieditortest here.

[build-badge]: https://img.shields.io/travis/user/repo/master.png?style=flat-square
[build]: https://travis-ci.org/user/repo

[npm-badge]: https://img.shields.io/npm/v/npm-package.png?style=flat-square
[npm]: https://www.npmjs.org/package/npm-package

[coveralls-badge]: https://img.shields.io/coveralls/user/repo/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/user/repo


#### React JSON Schema Form

We are currently using a custom fork of the react-jsonschema-form library.

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
```

##### Upgrading

Once you are done making changes, commit them and push.
Then merge those changes into the [composer branch](https://github.com/a-b-r-o-w-n/react-jsonschema-form/tree/composer).
Once merged, update the `yarn.lock` entry with the new commit id:

```
"react-jsonschema-form@git+https://git@github.com/a-b-r-o-w-n/react-jsonschema-form#composer":
  version "1.4.0"
  resolved "git+https://git@github.com/a-b-r-o-w-n/react-jsonschema-form#<new commit id>"
  dependencies:
    ...
```

