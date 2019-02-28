import React, {
  useState,
  useEffect,
  Fragment,
  useRef,
  useLayoutEffect,
  useCallback
} from "react";
import { NavItem } from "./components/NavItem";
import { Tree } from "./components/Tree";
import { Conversation } from "./components/Conversation";
import "./App.css";
import httpClient from "./utils/http";
import ExtensionContainerWrapper from "./ExtensionContainerWrapper";

import { initializeIcons } from "office-ui-fabric-react/lib/Icons";
import { ProjectExplorer } from "./components/ProjectExplorer";

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

    var data = files[index];
    // open or set editor
    setEditors([
      {
        col: 1,
        row: 1,
        data: data,
        name: "window1",
        parent: "window0(shell)"
      }
    ])

    
  }

  console.log(editors);

  return (
    <Fragment>
      <header className="App-header">
        <div className="header-aside">Composer</div>
        <div className="App-bot">
          <button
            className="bot-button"
            onClick={() =>
              client.toggleBot(botStatus, status => {
                setBotStatus(status);
              })
            }
          >
            {botStatus === "running" ? "Stop Bot" : "Start Bot"}
          </button>
          <span className="bot-message">
            {botStatus === "running"
              ? "Bot is running at http://localhost:3979"
              : ""}
          </span>
        </div>
      </header>
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
            height: '100%',
            display: "flex",
            overflow: 'auto',
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
              { editors.length > 0 && editors.map(item => {
                 return ( <ExtensionContainerWrapper name={item.name} data={item.data} onChange={handleValueChange} /> )
              })}
            </Conversation>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default App;
