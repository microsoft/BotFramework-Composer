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

initializeIcons(/* optional base url */);

function App() {
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
    setOpenFileIndex(index);
  }

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
              <Tree variant="large" />
              <div style={{ height: "20px" }} />
              <Tree />
            </div>
          </div>
          <div style={{ flex: 4, marginTop: "20px", marginLeft: "20px" }}>
            <Conversation />
          </div>
        </div>

        {/* <aside className="App-sidebar">
        <nav>
          <ul>
            {files.length > 0 &&
              files.map((item, index) => {
                return (
                  <li
                    key={item.name}
                    onClick={() => {
                      handleFileClick(item, index);
                    }}
                  >
                    {item.name}
                  </li>
                );
              })}
          </ul>
        </nav>
      </aside> */}
        {/* <main className="App-main">
          {openFileIndex > -1 && (
            <ExtensionContainerWrapper
              data={files[openFileIndex]}
              onChange={handleValueChange}
            />
          )}
        </main> */}
      </div>
    </Fragment>
  );
}

export default App;
