// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const fs = require('fs');
const path = require('path');

const map = require('lodash/map');
const reduce = require('lodash/reduce');
const zipObject = require('lodash/zipObject');

const ruleNames = map(fs.readdirSync(path.resolve(__dirname, 'rules')), (f) => f.replace(/\.js$/, ''));
const allRules = zipObject(
  ruleNames,
  map(ruleNames, (r) => require(`./rules/${r}`))
);

module.exports = {
  rules: allRules,
  configs: {
    recommended: {
      plugins: ['@bfc/eslint-plugin-bfcomposer'],
      rules: reduce(
        ruleNames,
        (all, rule) => ({
          ...all,
          [`@bfc/bfcomposer/${rule}`]: 'error',
        }),
        {}
      ),
    },
  },
};
