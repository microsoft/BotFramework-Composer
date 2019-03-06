import React, {
  useState,
  useEffect,
  Fragment,
  useRef,
  useLayoutEffect,
  useCallback
} from "react";

import { Header } from "./components/Header";
import { NavItem } from "./components/NavItem";
import { Tree } from "./components/Tree";
import { Conversation } from "./components/Conversation";
import "./App.css";
import httpClient from "./utils/http";

import { DefaultButton, IButtonProps } from "office-ui-fabric-react/lib/Button";
import { initializeIcons } from "office-ui-fabric-react/lib/Icons";
import { ProjectExplorer } from "./components/ProjectExplorer";
import { setPortalAttribute } from "@uifabric/utilities";

initializeIcons(/* optional base url */);

function App() {
  // central state for all editors\extensions
  // this would serve as the fundation of layout\data exchange\message routing
  const [editors, setEditors] = useState([
    /* 
    {
      col: 1,
      row: 1,
      data: { 
        name: "main.dialog",
        content: "blabla"
      },
      name: "window1",
      parent: "window0(shell)"
    }
    */
  ]);

  const [data, setData] = useState(null);

  const [files, setFiles] = useState([]);
  const [openFileIndex, setOpenFileIndex] = useState(-1);
  const [botStatus, setBotStatus] = useState("stopped");
  const openFileIndexRef = useRef();
  const filesRef = useRef();

  const client = new httpClient();

  useEffect(() => {
    client.getFiles(files => {
      if (files.length > 0) {
        setFiles(files);
      }
    });
  }, []);

  useEffect(() => {
    if (openFileIndex < 0) {
      return;
    }

    var data = files[openFileIndex];

    setEditors([
      {
        col: 1,
        row: 1,
        data: data,
        name: "window1",
        parent: "window0(shell)"
      }
    ]);
    // when open file index is changed, create or replace editor
  }, openFileIndex);

  useEffect(() => {
    window.addEventListener("message", receiveMessage, false);

    return function removeListener() {
      window.removeEventListener("message", receiveMessage, false);
    }
  })



  function getData() {
    return filesRef.current[openFileIndexRef.current];
  }

  // Make this huge receive message here because this function reply on locate state
  // Will move this out once we switch to a global state management solution

  function receiveMessage(event) {

    var message = event.data;

    if (message.type && message.type == "api_call") 
    {
      switch (message.name) {
        case 'getData': 
          event.source.postMessage({
            id: message.id,
            type: 'api_result',
            result: getData()
          })
          break;
        default:
          break;
      }
    }
  }

  useLayoutEffect(() => {
    openFileIndexRef.current = openFileIndex;
  });

  useLayoutEffect(() => {
    filesRef.current = files;
  });

  function handleValueChange(newFileObject) {
    const currentIndex = openFileIndexRef.current;
    const files = filesRef.current;

    let payload = {
      name: files[currentIndex].name,
      content: newFileObject.content
    };

    let newFiles = files.slice();
    newFiles[currentIndex].content = newFileObject.content;
    setFiles(newFiles);

    client.saveFile(payload);
  }

  function handleFileClick(file, index) {
    // keep a ref because we want to read that from outside
    setOpenFileIndex(index);
    setData(files[index]);
    setEditors([
      {
        col: 1,
        row: 1,
        data: files[index],
        name: "window1",
        parent: "window0(shell)"
      }
    ]);
  }

  return (
    <Fragment>
      <Header
        client={client}
        botStatus={botStatus}
        setBotStatus={setBotStatus}
      />
      <div style={{ backgroundColor: "#f6f6f6", height: "calc(100vh - 50px)" }}>
        <div
          style={{
            width: "80px",
            backgroundColor: "#eaeaea",
            height: "calc(99vh - 50px)",
            float: "left"
          }}
        >
          <NavItem iconName="SplitObject" label="Design" />
          <NavItem iconName="CollapseMenu" label="Content" />
          <NavItem iconName="Settings" label="Settings" />
        </div>
        <div
          style={{
            height: "100%",
            display: "flex",
            overflow: "auto",
            marginLeft: "80px",
            zIndex: 2
          }}
        >
          <div style={{ flex: 1, marginLeft: "30px", marginTop: "20px" }}>
            <div>
              <Tree variant="large">
                <ProjectExplorer files={files} onClick={handleFileClick} />
              </Tree>
              <div style={{ height: "20px" }} />
              <Tree />
            </div>
          </div>
          <div style={{ flex: 4, marginTop: "20px", marginLeft: "20px" }}>
            <Conversation>
              {editors.length > 0 &&
                editors.map(item => {
                  return (
                    <iframe 
                      key={item.name}
                      name={item.name}
                      style={{height:'100%', width:'100%', border: "0px"}} 
                      src='/extensionContainer.html'/>
                  );
                })}
            </Conversation>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default App;
