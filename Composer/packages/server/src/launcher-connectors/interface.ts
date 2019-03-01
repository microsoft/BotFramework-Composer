// far from final versoin 

export enum LauncherStatus {
    Running,
    Stopped
}

export interface LauncherConnector {
    status: LauncherStatus;
    start(): Boolean;  // maybe start should return address
    stop(): Boolean;
    inspect(): any;
}