import {getFiles,updateFile} from "../src/handlers/fileHandler";

const mockFilePath:string = "./__tests__/mockFile/1.botproj";

test("test get files function", () => {
    var files:any[] = getFiles(mockFilePath);
    expect(files.length).toBe(2);
});

test("test update file function", () => {
    const initValue:string = "old value";
    const newVaule:string = "new value";

    var files:any[] = getFiles(mockFilePath);
    updateFile(files[1].name,newVaule);
    files = getFiles(mockFilePath);

    expect(files[1].content).toBe(newVaule);
    updateFile(files[1].name,initValue);

});


