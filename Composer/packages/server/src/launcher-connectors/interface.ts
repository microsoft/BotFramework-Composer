import {LauncherStatus} from "./launcherStatus";

export interface ILauncherConnector {
    status: LauncherStatus;
    start(): boolean;  // maybe start should return address
    stop(): boolean;
    inspect(): any;
}