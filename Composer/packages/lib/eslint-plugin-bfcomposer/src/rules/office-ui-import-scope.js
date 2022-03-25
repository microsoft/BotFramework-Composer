// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const isOfficeUiFullImport = (str) => /@fluentui\/react$/.test(str);

module.exports = {
  create(context) {
    return {
      ImportDeclaration(node) {
        if (isOfficeUiFullImport(node.source.value)) {
          context.report({ node, message: 'Import Fluent UI components from /lib directory' });
        }
      },
    };
  },
};
