var interface_1 = require('./interface');
var process = require('child_process');
var composerConfig = require('../config.json');
var CSharpLauncherConnector = (function () {
    function CSharpLauncherConnector(config) {
        var _this = this;
        this.command = "dotnet run";
        this.child = null;
        this.status = interface_1.LauncherStatus.Stopped;
        this.start = function () {
            console.log("Current dir:");
            console.log("Starting launcher with command " + cmd);
            var cmd = "cd " + _this.path + " &&  " + _this.command + " --bot:provider=" + composerConfig.bot.provider + " --bot:path=" + composerConfig.bot.path;
            console.log("Starting launcher with command " + cmd);
            _this.child = process.exec(cmd, function (error, stdout, stderr) {
                if (error) {
                    console.error("error: " + error);
                    return;
                }
                console.log("stdout: " + stdout);
                console.log("stderr: " + stderr);
            });
            _this.status = interface_1.LauncherStatus.Running;
            return true;
        };
        this.stop = function () {
            console.log("Stopping launcher");
            // TODO: this not kill sub-process
            _this.child.kill();
            _this.status = interface_1.LauncherStatus.Stopped;
            return true;
        };
        this.inspect = function () {
            return true;
        };
        this.path = config.path;
    }
    return CSharpLauncherConnector;
})();
exports.CSharpLauncherConnector = CSharpLauncherConnector;
