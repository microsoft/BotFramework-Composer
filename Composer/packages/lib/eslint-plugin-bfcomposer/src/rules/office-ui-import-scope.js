const isOfficeUiFullImport = str => /office-ui-fabric-react$/.test(str);

module.exports = {
  create(context) {
    return {
      ImportDeclaration(node) {
        if (isOfficeUiFullImport(node.source.value)) {
          context.report({ node, message: 'Import Office UI components from /lib directory' });
        }
      },
    };
  },
};
