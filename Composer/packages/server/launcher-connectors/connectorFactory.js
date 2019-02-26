var csharpLauncherConnector_1 = require('./csharpLauncherConnector');
var ConnectorFactory = (function () {
    function ConnectorFactory() {
    }
    ConnectorFactory.prototype.CreateConnector = function (connectorConfig) {
        if (connectorConfig.type == "CSharp") {
            return new csharpLauncherConnector_1.CSharpLauncherConnector(connectorConfig);
        }
        throw new Error("unrecognize connector type");
    };
    return ConnectorFactory;
})();
exports.ConnectorFactory = ConnectorFactory;
