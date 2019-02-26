// far from final versoin 
(function (LauncherStatus) {
    LauncherStatus[LauncherStatus["Running"] = 0] = "Running";
    LauncherStatus[LauncherStatus["Stopped"] = 1] = "Stopped";
})(exports.LauncherStatus || (exports.LauncherStatus = {}));
var LauncherStatus = exports.LauncherStatus;
