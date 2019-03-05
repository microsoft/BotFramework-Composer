import {startServer,stopServer,getStatus} from "../src/handlers/launcherHandler";
import {LauncherStatus} from "../src/launcher-connectors/launcherStatus";

function statusToString(status:LauncherStatus):string {
    let statusStr:string = status === LauncherStatus.Running ? "Running":"Stopped";
    return statusStr;
}

test("test start launcher handler should not throw error",()=> {
    expect(()=>startServer()).not.toThrowError();
    expect(getStatus()).toBe(statusToString(LauncherStatus.Running));
});

test("test start launcher handler should throw error",()=> {
    expect(()=>startServer()).toThrowError();
});

test("test stop launcher handler should not throw error",()=> {
    expect(()=>stopServer()).not.toThrowError();
    expect(getStatus()).toBe(statusToString(LauncherStatus.Stopped));
});

test("test stop launcher handler should throw error",()=> {
    expect(()=>stopServer()).toThrowError();
});